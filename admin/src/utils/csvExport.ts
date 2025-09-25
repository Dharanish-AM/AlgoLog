import { ContestParticipant } from '../types';

export const exportToCSV = (participants: ContestParticipant[], contestTitle: string) => {
  const headers = [
    'S.No',
    'Roll No',
    'Name', 
    'Problems Solved',
    'Total Problems',
    'Rating',
    'Rank',
    'Trend',
    'Finish Time (seconds)'
  ];

  const csvContent = [
    headers.join(','),
    ...participants.map((participant, index) => [
      (index + 1).toString(),
      participant.rollNo,
      `"${participant.name}"`,
      participant.problemsSolved.toString(),
      participant.totalProblems.toString(),
      participant.rating.toString(),
      participant.rank.toString(),
      participant.trend,
      participant.finishTime.toString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${contestTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};