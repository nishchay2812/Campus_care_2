import { ComplaintRecord } from '../types';

/**
 * ============================================================================
 * TEMPORARY SAMPLE COMPLAINT DATASET (FRONTEND DEMONSTRATION ONLY)
 * ============================================================================
 * This dataset is utilized strictly for demonstration purposes in the
 * CampusCare Lite administrator dashboard before Supabase / backend integration.
 * In a future stage, this data source will be replaced by real queries from Supabase.
 */

export const INITIAL_SAMPLE_COMPLAINTS: ComplaintRecord[] = [
  {
    id: 'CMP-101',
    studentName: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    category: 'Electrical',
    location: 'Block B, Room 302',
    description: 'Fluorescent tube light is continuously flickering and producing a high-pitched buzzing sound during lectures.',
    date: '2026-10-31',
    status: 'Pending',
  },
  {
    id: 'CMP-102',
    studentName: 'Priya Patel',
    email: 'priya.patel@college.edu',
    category: 'IT / Computers',
    location: 'Computer Lab 3, Workstation 14',
    description: 'The desktop machine fails to boot into the OS due to a persistent memory error beep code. Needs IT technician check.',
    date: '2026-10-30',
    status: 'In Progress',
  },
  {
    id: 'CMP-103',
    studentName: 'Rahul Verma',
    email: 'rahul.verma@college.edu',
    category: 'Classroom Equipment',
    location: 'Auditorium Hall, Audio Booth',
    description: 'Wireless microphone unit 2 loses frequency connection intermittently when speaker walks across the stage podium.',
    date: '2026-10-30',
    status: 'In Progress',
  },
  {
    id: 'CMP-104',
    studentName: 'Ananya Iyer',
    email: 'ananya.iyer@college.edu',
    category: 'Water / Plumbing',
    location: 'Library 1st Floor, Restroom 1B',
    description: 'Severe water leak underneath the center washbasin pipe resulting in slippery floor tiles near the entrance.',
    date: '2026-10-29',
    status: 'Resolved',
  },
  {
    id: 'CMP-105',
    studentName: 'Rohan Deshmukh',
    email: 'rohan.d@college.edu',
    category: 'Cleanliness',
    location: 'Main Canteen, Annex Pathway',
    description: 'Overflowing recycle bins after afternoon break. Litter is blowing onto the lawn walkway area.',
    date: '2026-10-29',
    status: 'Pending',
  },
  {
    id: 'CMP-106',
    studentName: 'Sneha Nair',
    email: 'sneha.nair@college.edu',
    category: 'Classroom Equipment',
    location: 'Block A, Seminar Hall 101',
    description: 'Ceiling projector lamp warning light is red and image brightness is severely degraded during presentations.',
    date: '2026-10-28',
    status: 'Pending',
  },
  {
    id: 'CMP-107',
    studentName: 'Devansh Kulkarni',
    email: 'devansh.k@college.edu',
    category: 'Electrical',
    location: 'Hostel 3, Ground Floor Lounge',
    description: 'Wall power outlet has charred marks and smells like burnt plastic. Currently switched off for student safety.',
    date: '2026-10-27',
    status: 'In Progress',
  },
  {
    id: 'CMP-108',
    studentName: 'Tanvi Joshi',
    email: 'tanvi.joshi@college.edu',
    category: 'Water / Plumbing',
    location: 'Mechanical Workshop, Drinking Cooler',
    description: 'Water dispenser water is lukewarm and cooling compressor appears tripped after yesterday power fluctuation.',
    date: '2026-10-26',
    status: 'Resolved',
  },
  {
    id: 'CMP-109',
    studentName: 'Vikram Mehta',
    email: 'vikram.m@college.edu',
    category: 'Other',
    location: 'Sports Complex, South Gate',
    description: 'Metal security latch on the equipment locker room door is misaligned and cannot be locked securely.',
    date: '2026-10-25',
    status: 'Resolved',
  },
];
