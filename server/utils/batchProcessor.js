/**
 * Advanced Batch Processor with error handling, retry logic, and progress tracking
 * Note: Using simple concurrency control without p-limit
 */
class BatchProcessor {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 5;
    this.batchSize = options.batchSize || 10;
    this.retryAttempts = options.retryAttempts || 2;
    this.retryDelay = options.retryDelay || 1000;
    this.timeout = options.timeout || 30000;
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
    const batches = this.createBatches(items);

    console.log(`📦 Processing ${items.length} items in ${batches.length} batches (${this.batchSize} items/batch, ${this.concurrency} concurrent)`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartTime = Date.now();

      console.log(`\n🔄 Batch ${batchIndex + 1}/${batches.length} started...`);

      
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
      console.log(`✅ Batch ${batchIndex + 1}/${batches.length} completed in ${(batchDuration / 1000).toFixed(2)}s`);

      
      if (this.callbacks.onBatchComplete) {
        this.callbacks.onBatchComplete({
          batchIndex,
          totalBatches: batches.length,
          batchSize: batch.length,
          duration: batchDuration,
        });
      }

      
      if (batchIndex < batches.length - 1) {
        const interBatchDelay = 3000; 
        console.log(`⏸️  Waiting ${interBatchDelay / 1000}s before next batch...`);
        await this.delay(interBatchDelay);
      }
    }

    this.stats.endTime = Date.now();
    const totalDuration = this.stats.endTime - this.stats.startTime;

    console.log(`\n✨ Batch processing complete!`);
    console.log(`📊 Stats: ${this.stats.succeeded} succeeded, ${this.stats.failed} failed, ${this.stats.skipped} skipped`);
    console.log(`⏱️  Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`⚡ Average: ${(totalDuration / items.length).toFixed(0)}ms per item`);

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
}

module.exports = BatchProcessor;
