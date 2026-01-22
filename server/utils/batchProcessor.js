// 🔵 Enhanced colorful logging wrapper (auto-applies to all console logs)
const chalk = require("chalk"); // Ensure chalk@4 is installed
const ErrorTracker = require('./errorTracker');

// Override console methods with color-enhanced professional logging
const _log = console.log;
console.log = (...args) => _log(chalk.cyan(...args));

const _warn = console.warn;
console.warn = (...args) => _warn(chalk.keyword("orange")(...args));

const _error = console.error;
console.error = (...args) => _error(chalk.red(...args));

const _info = console.info;
console.info = (...args) => _info(chalk.blue(...args));

// Initialize error tracker
const errorTracker = new ErrorTracker();

// 🎨 Pretty block logger (Option C)
function prettyBlock(title, lines = []) {
  const border = "─".repeat(60);
  console.log("\n" + border);
  console.log(`🟣 ${title}`);
  console.log(border);
  for (const line of lines) console.log(line);
  console.log(border + "\n");
}

/**
 * Advanced Batch Processor with error handling, retry logic, and progress tracking
 * Includes: Circuit breaker, adaptive concurrency, resume capability, priority queue
 */
class BatchProcessor {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 10; // Increased from 8 to 10
    this.originalConcurrency = this.concurrency;
    this.batchSize = options.batchSize || 20; // Increased from 15 to 20
    this.retryAttempts = options.retryAttempts || 1; // Reduced from 2
    this.retryDelay = options.retryDelay || 500; // Faster retry
    this.timeout = options.timeout || 25000; // Faster timeout
    this.stats = {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      startTime: null,
      endTime: null,
    };
    this.errors = [];
    this.callbacks = {
      onProgress: null,
      onBatchComplete: null,
      onError: null,
    };
    
    // 4. Circuit breaker state
    this.circuitBreaker = {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failures: 0,
      threshold: options.circuitBreakerThreshold || 10, // More tolerant
      resetTimeout: options.circuitBreakerResetTimeout || 15000, // Faster reset
      lastFailureTime: null,
    };
    
    // 4. Adaptive concurrency
    this.adaptiveConcurrency = {
      enabled: options.adaptiveConcurrency !== false,
      errorRateThreshold: 0.6, // 60% error rate threshold
      recentErrors: [],
      windowSize: 15, // Track last 15 operations
    };
    
    // 7. Resume capability
    this.resumeState = {
      enabled: options.enableResume || false,
      lastProcessedIndex: -1,
      checkpointInterval: options.checkpointInterval || 10,
    };
    
    // 7. Priority queue support
    this.priorityQueue = {
      enabled: options.enablePriority || false,
      priorityFn: options.priorityFn || null,
    };
  }

  /**
   * Set progress callback
   */
  onProgress(callback) {
    this.callbacks.onProgress = callback;
    return this;
  }

  /**
   * Set batch complete callback
   */
  onBatchComplete(callback) {
    this.callbacks.onBatchComplete = callback;
    return this;
  }

  /**
   * Set error callback
   */
  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }

  /**
   * Process items in batches with concurrency control
   * Includes circuit breaker, adaptive concurrency, and resume capability
   */
  async processBatch(items, processFn) {
    this.stats.total = items.length;
    this.stats.startTime = Date.now();
    this.stats.processed = 0;
    this.stats.succeeded = 0;
    this.stats.failed = 0;
    this.stats.skipped = 0;
    this.errors = [];

    const results = [];
    
    // 7. Priority queue - sort items by priority if enabled
    if (this.priorityQueue.enabled && this.priorityQueue.priorityFn) {
      items = [...items].sort(this.priorityQueue.priorityFn);
      console.log('📊 Items sorted by priority');
    }
    
    // 7. Resume from checkpoint if enabled
    let startIndex = 0;
    if (this.resumeState.enabled && this.resumeState.lastProcessedIndex >= 0) {
      startIndex = this.resumeState.lastProcessedIndex + 1;
      console.log(`🔄 Resuming from index ${startIndex}`);
      items = items.slice(startIndex);
      this.stats.total = items.length;
    }

    const batches = this.createBatches(items);

    console.log(`📦 Processing ${items.length} items in ${batches.length} batches (${this.batchSize} items/batch, ${this.concurrency} concurrent)`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      // 4. Check circuit breaker state
      if (this.circuitBreaker.state === 'OPEN') {
        const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
        if (timeSinceLastFailure > this.circuitBreaker.resetTimeout) {
          console.log('🔧 Circuit breaker transitioning to HALF_OPEN');
          this.circuitBreaker.state = 'HALF_OPEN';
          this.circuitBreaker.failures = 0;
        } else {
          console.error('⛔ Circuit breaker OPEN - skipping remaining batches');
          break;
        }
      }

      const batch = batches[batchIndex];
      const batchStartTime = Date.now();

      prettyBlock(
        `Batch ${batchIndex + 1}/${batches.length} Started`,
        [
          `📦 Concurrency : ${this.concurrency}`,
          `📏 Batch Size  : ${batch.length} items`
        ]
      );

      
      const batchResults = await this.processConcurrently(
        batch,
        (item, itemIndex) => {
          const globalIndex = batchIndex * this.batchSize + itemIndex;
          return this.processItemWithRetry(item, processFn, globalIndex);
        }
      );

      
      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i];
        const item = batch[i];

        if (result.status === 'fulfilled') {
          if (result.value.success) {
            this.stats.succeeded++;
            results.push({ item, data: result.value.data, success: true });
          } else if (result.value.skipped) {
            this.stats.skipped++;
            results.push({ item, skipped: true, reason: result.value.reason });
          } else {
            this.stats.failed++;
            this.errors.push({ item, error: result.value.error });
            results.push({ item, success: false, error: result.value.error });
          }
        } else {
          this.stats.failed++;
          this.errors.push({ item, error: result.reason });
          results.push({ item, success: false, error: result.reason });
        }

        this.stats.processed++;

        
        if (this.callbacks.onProgress) {
          this.callbacks.onProgress({
            ...this.stats,
            percentage: (this.stats.processed / this.stats.total) * 100,
          });
        }
      }

      const batchDuration = Date.now() - batchStartTime;
      const batchSuccessRate = batch.length > 0 ? this.stats.succeeded / this.stats.processed : 1;
      
      prettyBlock(
        `Batch ${batchIndex + 1}/${batches.length} Completed`,
        [
          `⏱ Duration     : ${(batchDuration / 1000).toFixed(2)}s`,
          `🎯 Success Rate : ${(batchSuccessRate * 100).toFixed(1)}%`,
          `🔌 Circuit     : ${this.circuitBreaker.state}`,
          `⚙️ Concurrency  : ${this.concurrency}`
        ]
      );

      // 4. Update circuit breaker based on batch results
      const batchErrors = batchResults.filter(r => r.status === 'rejected' || !r.value?.success).length;
      if (batchErrors > batch.length * 0.5) { // >50% failure rate
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
          console.error(`⛔ Circuit breaker OPENED after ${this.circuitBreaker.failures} consecutive failures`);
          this.circuitBreaker.state = 'OPEN';
        }
      } else if (this.circuitBreaker.state === 'HALF_OPEN') {
        console.log('✅ Circuit breaker transitioning to CLOSED');
        this.circuitBreaker.state = 'CLOSED';
        this.circuitBreaker.failures = 0;
      }
      
      // 4. Adaptive concurrency based on error rate
      if (this.adaptiveConcurrency.enabled) {
        const errorRate = this.stats.processed > 0 ? this.stats.failed / this.stats.processed : 0;
        
        if (errorRate > this.adaptiveConcurrency.errorRateThreshold) {
          // Reduce concurrency
          this.concurrency = Math.max(1, Math.floor(this.concurrency * 0.7));
          console.warn(`⬇️  Reducing concurrency to ${this.concurrency} due to high error rate (${(errorRate * 100).toFixed(1)}%)`);
        } else if (errorRate < 0.1 && this.concurrency < this.originalConcurrency) {
          // Gradually increase concurrency
          this.concurrency = Math.min(this.originalConcurrency, this.concurrency + 1);
          console.log(`⬆️  Increasing concurrency to ${this.concurrency}`);
        }
      }
      
      // 7. Save checkpoint for resume capability
      if (this.resumeState.enabled && (batchIndex + 1) % this.resumeState.checkpointInterval === 0) {
        this.resumeState.lastProcessedIndex = startIndex + (batchIndex + 1) * this.batchSize - 1;
        console.log(`💾 Checkpoint saved at index ${this.resumeState.lastProcessedIndex}`);
      }

      
      if (this.callbacks.onBatchComplete) {
        this.callbacks.onBatchComplete({
          batchIndex,
          totalBatches: batches.length,
          batchSize: batch.length,
          duration: batchDuration,
          successRate: batchSuccessRate,
          circuitBreakerState: this.circuitBreaker.state,
          currentConcurrency: this.concurrency,
        });
      }

      
      if (batchIndex < batches.length - 1) {
        const interBatchDelay = 1500; // Reduced from 3000ms
        console.log(`⏸️  Waiting ${interBatchDelay / 1000}s before next batch...`);
        await this.delay(interBatchDelay);
      }
    }

    this.stats.endTime = Date.now();
    const totalDuration = this.stats.endTime - this.stats.startTime;

    prettyBlock(
      "Batch Processing Complete",
      [
        `✔ Succeeded : ${this.stats.succeeded}`,
        `❌ Failed    : ${this.stats.failed}`,
        `⏭ Skipped   : ${this.stats.skipped}`,
        `⏱ Duration  : ${(totalDuration / 1000).toFixed(2)}s`,
        `⚡ Avg/Item  : ${(totalDuration / items.length).toFixed(0)}ms`
      ]
    );

    return {
      results,
      stats: this.stats,
      errors: this.errors,
    };
  }

  /**
   * Process items concurrently with controlled concurrency
   */
  async processConcurrently(items, processFn) {
    const results = [];
    const executing = [];

    for (let i = 0; i < items.length; i++) {
      const promise = Promise.resolve().then(() => processFn(items[i], i));
      results.push(promise);

      if (this.concurrency <= items.length) {
        const e = promise.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);

        if (executing.length >= this.concurrency) {
          await Promise.race(executing);
        }
      }
    }

    return Promise.allSettled(results);
  }

  /**
   * Process single item with retry logic
   */
  async processItemWithRetry(item, processFn, index) {
    let lastError;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.timeout)
        );

        const result = await Promise.race([
          processFn(item, index),
          timeoutPromise,
        ]);

        return { success: true, data: result };
      } catch (error) {
        lastError = error;

        if (attempt < this.retryAttempts) {
          console.warn(`⚠️  Retry ${attempt + 1}/${this.retryAttempts} for item ${index + 1}`);
          await this.delay(this.retryDelay * (attempt + 1));
        }

        if (this.callbacks.onError) {
          this.callbacks.onError({ item, error, attempt, index });
        }
      }
    }

    return { success: false, error: lastError?.message || 'Unknown error' };
  }

  /**
   * Create batches from items array
   */
  createBatches(items) {
    const batches = [];
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize));
    }
    return batches;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current stats
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get errors
   */
  getErrors() {
    return [...this.errors];
  }
  
  /**
   * 7. Set priority function for priority queue
   */
  setPriorityFunction(priorityFn) {
    this.priorityQueue.priorityFn = priorityFn;
    this.priorityQueue.enabled = true;
    return this;
  }
  
  /**
   * 7. Enable resume capability
   */
  enableResume(checkpointInterval = 10) {
    this.resumeState.enabled = true;
    this.resumeState.checkpointInterval = checkpointInterval;
    return this;
  }
  
  /**
   * 7. Get resume state for persistence
   */
  getResumeState() {
    return {
      lastProcessedIndex: this.resumeState.lastProcessedIndex,
      stats: { ...this.stats },
      circuitBreakerState: this.circuitBreaker.state,
    };
  }
  
  /**
   * 7. Load resume state from persistence
   */
  loadResumeState(state) {
    if (state.lastProcessedIndex !== undefined) {
      this.resumeState.lastProcessedIndex = state.lastProcessedIndex;
      this.resumeState.enabled = true;
    }
    return this;
  }
  
  /**
   * 4. Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return {
      state: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures,
      threshold: this.circuitBreaker.threshold,
      timeSinceLastFailure: this.circuitBreaker.lastFailureTime 
        ? Date.now() - this.circuitBreaker.lastFailureTime 
        : null,
    };
  }
  
  /**
   * 4. Reset circuit breaker manually
   */
  resetCircuitBreaker() {
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;
    console.log('🔧 Circuit breaker manually reset to CLOSED');
    return this;
  }
}

module.exports = BatchProcessor;
module.exports.errorTracker = errorTracker;
