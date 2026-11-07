// Copyright 2026 The TRUI Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// The icon set: shapes in a 24 × 24 grid, outlines with round caps and
// joins, drawn with the stroke width of the theme. A shape with fill: true is
// filled. scripts/gen-icons.mjs turns this file into one module per icon.

const circle = (cx, cy, r) =>
  `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0 ${r} ${r} 0 0 1 ${2 * r} 0z`;
const dot = (cx, cy, r = 1) => ({ d: circle(cx, cy, r), fill: true });
const ring = circle(12, 12, 9);

export const categories = {
  actions: 'Actions',
  status: 'Status and messages',
  navigation: 'Navigation',
  documents: 'Documents and files',
  people: 'People and organization',
  time: 'Calendar and time',
  admin: 'Settings and administration',
};

export const icons = [
  // Actions
  { name: 'add', category: 'actions', shapes: ['M12 5v14', 'M5 12h14'] },
  { name: 'minus', category: 'actions', shapes: ['M5 12h14'] },
  { name: 'edit', category: 'actions', shapes: ['M4 20h4L19 9l-4-4L4 16v4z', 'M13.5 6.5l4 4'] },
  {
    name: 'delete',
    category: 'actions',
    shapes: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13', 'M10 11v5.5', 'M14 11v5.5'],
  },
  { name: 'search', category: 'actions', shapes: [circle(11, 11, 6), 'M15.5 15.5L20 20'] },
  { name: 'filter', category: 'actions', shapes: ['M4 5h16l-6 7.5V18l-4 2v-7.5L4 5z'] },
  {
    name: 'sort',
    category: 'actions',
    shapes: ['M8 4v16', 'M4 8l4-4 4 4', 'M16 20V4', 'M12 16l4 4 4-4'],
  },
  {
    name: 'sort-ascending',
    category: 'actions',
    shapes: ['M4 6h3', 'M4 12h5', 'M4 18h7', 'M17 20V4', 'M13 8l4-4 4 4'],
  },
  {
    name: 'sort-descending',
    category: 'actions',
    shapes: ['M4 6h7', 'M4 12h5', 'M4 18h3', 'M17 4v16', 'M13 16l4 4 4-4'],
  },
  {
    name: 'export',
    category: 'actions',
    shapes: ['M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8', 'M10 12h10', 'M17 9l3 3-3 3'],
    mirrorInRtl: true,
  },
  {
    name: 'import',
    category: 'actions',
    shapes: ['M10 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8', 'M4 12h10', 'M11 9l3 3-3 3'],
    mirrorInRtl: true,
  },
  {
    name: 'print',
    category: 'actions',
    shapes: [
      'M7 9V4h10v5',
      'M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2',
      'M7 14h10v6H7z',
    ],
  },
  {
    name: 'copy',
    category: 'actions',
    shapes: [
      'M10 8h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z',
      'M15 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4',
    ],
  },
  {
    name: 'save',
    category: 'actions',
    shapes: [
      'M5 4h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
      'M8 4v4h7V4',
      'M8 20v-6h8v6',
    ],
  },
  {
    name: 'refresh',
    category: 'actions',
    shapes: ['M20 12a8 8 0 1 1-2.34-5.66', 'M19.5 3.5v4h-4'],
  },
  {
    name: 'upload',
    category: 'actions',
    shapes: ['M12 15V4', 'M7 9l5-5 5 5', 'M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4'],
  },
  {
    name: 'download',
    category: 'actions',
    shapes: ['M12 4v11', 'M7 10l5 5 5-5', 'M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4'],
  },
  {
    name: 'more-horizontal',
    category: 'actions',
    shapes: [dot(6, 12, 1.5), dot(12, 12, 1.5), dot(18, 12, 1.5)],
  },
  {
    name: 'more-vertical',
    category: 'actions',
    shapes: [dot(12, 6, 1.5), dot(12, 12, 1.5), dot(12, 18, 1.5)],
  },
  { name: 'close', category: 'actions', shapes: ['M6 6l12 12', 'M18 6L6 18'] },
  { name: 'check', category: 'actions', shapes: ['M5 12.5l4.5 4.5L19 7'] },
  {
    name: 'link',
    category: 'actions',
    shapes: [
      'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1',
      'M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
    ],
  },
  { name: 'pin', category: 'actions', shapes: ['M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5z', 'M12 14v6'] },
  {
    name: 'lock',
    category: 'actions',
    shapes: [
      'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z',
      'M8 11V8a4 4 0 0 1 8 0v3',
    ],
  },
  {
    name: 'unlock',
    category: 'actions',
    shapes: [
      'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z',
      'M8 11V8a4 4 0 0 1 7.75-1.4',
    ],
  },
  {
    name: 'visible',
    category: 'actions',
    shapes: [
      'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z',
      circle(12, 12, 3),
    ],
  },
  {
    name: 'hidden',
    category: 'actions',
    shapes: [
      'M9.9 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.4 3.2',
      'M6.6 6.9A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.6-1.3',
      'M9.9 9.9a3 3 0 0 0 4.2 4.2',
      'M4 4l16 16',
    ],
  },
  {
    name: 'star',
    category: 'actions',
    shapes: ['M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z'],
  },
  {
    name: 'star-filled',
    category: 'actions',
    shapes: [
      {
        d: 'M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z',
        fill: true,
      },
    ],
  },

  // Status and messages
  { name: 'info', category: 'status', shapes: [ring, 'M12 11v6', dot(12, 7.5)] },
  { name: 'success', category: 'status', shapes: [ring, 'M8 12.5l2.5 2.5L16 9.5'] },
  {
    name: 'warning',
    category: 'status',
    shapes: [
      'M10.3 4.9L2.9 18a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0z',
      'M12 10v4',
      dot(12, 17.5),
    ],
  },
  {
    name: 'error',
    category: 'status',
    shapes: ['M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2z', 'M12 7.5v5.5', dot(12, 16.5)],
  },
  {
    name: 'question',
    category: 'status',
    shapes: [ring, 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6', dot(12, 17)],
  },
  {
    name: 'notification',
    category: 'status',
    shapes: ['M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16z', 'M10 21a2 2 0 0 0 4 0'],
  },

  // Navigation
  { name: 'chevron-down', category: 'navigation', shapes: ['M6 9l6 6 6-6'] },
  { name: 'chevron-up', category: 'navigation', shapes: ['M6 15l6-6 6 6'] },
  { name: 'chevron-left', category: 'navigation', shapes: ['M15 6l-6 6 6 6'], mirrorInRtl: true },
  { name: 'chevron-right', category: 'navigation', shapes: ['M9 6l6 6-6 6'], mirrorInRtl: true },
  {
    name: 'arrow-left',
    category: 'navigation',
    shapes: ['M19 12H5', 'M11 6l-6 6 6 6'],
    mirrorInRtl: true,
  },
  {
    name: 'arrow-right',
    category: 'navigation',
    shapes: ['M5 12h14', 'M13 6l6 6-6 6'],
    mirrorInRtl: true,
  },
  { name: 'home', category: 'navigation', shapes: ['M4 11l8-7 8 7', 'M6 9.5V20h4v-6h4v6h4V9.5'] },
  { name: 'menu', category: 'navigation', shapes: ['M4 6h16', 'M4 12h16', 'M4 18h16'] },
  {
    name: 'external-link',
    category: 'navigation',
    shapes: ['M14 4h6v6', 'M20 4l-8 8', 'M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4'],
    mirrorInRtl: true,
  },
  {
    name: 'grid',
    category: 'navigation',
    shapes: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  },
  {
    name: 'list',
    category: 'navigation',
    shapes: ['M9 6h11', 'M9 12h11', 'M9 18h11', dot(5, 6), dot(5, 12), dot(5, 18)],
    mirrorInRtl: true,
  },

  {
    name: 'sidebar',
    category: 'navigation',
    shapes: ['M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M9 4v16'],
    mirrorInRtl: true,
  },

  // Documents and files
  {
    name: 'document',
    category: 'documents',
    shapes: ['M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4z', 'M14 3v4h4'],
  },
  {
    name: 'document-text',
    category: 'documents',
    shapes: [
      'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4z',
      'M14 3v4h4',
      'M9 12h6',
      'M9 16h6',
    ],
  },
  {
    name: 'folder',
    category: 'documents',
    shapes: ['M4 6a1 1 0 0 1 1-1h4.5l2 2H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6z'],
  },
  {
    name: 'attachment',
    category: 'documents',
    shapes: [
      'M20 11.5l-7.8 7.8a5 5 0 0 1-7.07-7.07l8.5-8.5a3.3 3.3 0 0 1 4.67 4.67l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8',
    ],
  },

  // People and organization
  { name: 'person', category: 'people', shapes: [circle(12, 8, 4), 'M4 20a8 8 0 0 1 16 0'] },

  // Calendar and time
  {
    name: 'calendar',
    category: 'time',
    shapes: [
      'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
      'M4 10h16',
      'M8 4v4',
      'M16 4v4',
    ],
  },
  { name: 'clock', category: 'time', shapes: [ring, 'M12 7v5l3 2'] },

  // Settings and administration
  {
    name: 'settings',
    category: 'admin',
    shapes: [
      circle(12, 12, 3),
      'M10.3 3h3.4l.5 2.4 1.6.9 2.3-.8 1.7 3-1.8 1.6v1.8l1.8 1.6-1.7 3-2.3-.8-1.6.9-.5 2.4h-3.4l-.5-2.4-1.6-.9-2.3.8-1.7-3 1.8-1.6v-1.8L4.2 8.5l1.7-3 2.3.8 1.6-.9.5-2.4z',
    ],
  },
];
