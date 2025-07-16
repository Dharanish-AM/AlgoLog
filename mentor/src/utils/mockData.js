export const getMockData = () => {
  return [
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      leetcode: {
        easy: 120,
        medium: 85,
        hard: 23,
        total: 228
      },
      hackerrank: {
        badges: [
          { name: 'Problem Solving', level: '5 Star' },
          { name: 'Python', level: '5 Star' },
          { name: 'SQL', level: '4 Star' },
          { name: 'Java', level: '3 Star' },
          { name: 'C++', level: '3 Star' }
        ]
      },
      codechef: {
        rating: 1892,
        solved: 127,
        rank: '3★'
      },
      codeforces: {
        rating: 1725,
        rank: 'Expert',
        contests: 24
      }
    },
    // ... rest of the mock data remains the same
  ];
};