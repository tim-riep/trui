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
const rect = (x, y, w, h, r = 1) =>
  r === 0
    ? `M${x} ${y}h${w}v${h}h-${w}z`
    : `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}z`;
const page = 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4z';
const pageFold = 'M14 3v4h4';
const calendarFrame = 'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z';
const shieldOutline = 'M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6L12 3z';
const bubble =
  'M5 4h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7l-4 3.5V17H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z';

export const categories = {
  actions: 'Actions',
  status: 'Status and messages',
  navigation: 'Navigation',
  documents: 'Documents and files',
  finance: 'Finance and invoices',
  sales: 'Purchasing and sales',
  logistics: 'Warehouse and shipping',
  people: 'People and organization',
  time: 'Calendar and time',
  admin: 'Settings and administration',
  analytics: 'Reports and charts',
};

export const icons = [
  // Actions
  { name: 'add', category: 'actions', shapes: ['M12 5v14', 'M5 12h14'] },
  { name: 'minus', category: 'actions', shapes: ['M5 12h14'] },
  {
    name: 'edit',
    category: 'actions',
    shapes: ['M4 20h4L19 9l-4-4L4 16v4z', 'M13.5 6.5l4 4'],
  },
  {
    name: 'delete',
    category: 'actions',
    shapes: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13', 'M10 11v5.5', 'M14 11v5.5'],
  },
  {
    name: 'search',
    category: 'actions',
    shapes: [circle(11, 11, 6), 'M15.5 15.5L20 20'],
  },
  {
    name: 'filter',
    category: 'actions',
    shapes: ['M4 5h16l-6 7.5V18l-4 2v-7.5L4 5z'],
  },
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
  {
    name: 'pin',
    category: 'actions',
    shapes: ['M9 4h6l-1 5 3 3v2H7v-2l3-3-1-5z', 'M12 14v6'],
  },
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
  {
    name: 'paste',
    category: 'actions',
    shapes: [
      'M9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3',
      rect(9, 3, 6, 4),
      'M9 12h6',
      'M9 16h4',
    ],
  },
  {
    name: 'undo',
    category: 'actions',
    shapes: ['M9 14L4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
    mirrorInRtl: true,
  },
  {
    name: 'redo',
    category: 'actions',
    shapes: ['M15 14l5-5-5-5', 'M20 9H9.5a5.5 5.5 0 0 0 0 11H13'],
    mirrorInRtl: true,
  },
  {
    name: 'share',
    category: 'actions',
    shapes: [
      circle(18, 5.5, 2.5),
      circle(6, 12, 2.5),
      circle(18, 18.5, 2.5),
      'M8.2 10.8l7.6-4.1',
      'M8.2 13.2l7.6 4.1',
    ],
  },
  {
    name: 'settings-sliders',
    category: 'actions',
    shapes: [
      'M4 6h9M17 6h3',
      circle(15, 6, 2),
      'M4 12h3M11 12h9',
      circle(9, 12, 2),
      'M4 18h11M19 18h1',
      circle(17, 18, 2),
    ],
  },
  {
    name: 'columns',
    category: 'actions',
    shapes: [rect(4, 4, 16, 16), 'M9.5 4v16', 'M14.5 4v16'],
  },
  {
    name: 'zoom-in',
    category: 'actions',
    shapes: [circle(11, 11, 6), 'M15.5 15.5L20 20', 'M8.5 11h5', 'M11 8.5v5'],
  },
  {
    name: 'zoom-out',
    category: 'actions',
    shapes: [circle(11, 11, 6), 'M15.5 15.5L20 20', 'M8.5 11h5'],
  },
  {
    name: 'fullscreen',
    category: 'actions',
    shapes: [
      'M4 9V5a1 1 0 0 1 1-1h4',
      'M15 4h4a1 1 0 0 1 1 1v4',
      'M20 15v4a1 1 0 0 1-1 1h-4',
      'M9 20H5a1 1 0 0 1-1-1v-4',
    ],
  },
  {
    name: 'unlink',
    category: 'actions',
    shapes: [
      'M12 8l2-2a4 4 0 0 1 5.66 5.66l-2 2',
      'M12 16l-2 2a4 4 0 0 1-5.66-5.66l2-2',
      'M8 3.5v2',
      'M3.5 8h2',
      'M16 18.5v2',
      'M18.5 16h2',
    ],
  },
  {
    name: 'favorite',
    category: 'actions',
    shapes: ['M12 7.5a4 4 0 0 1 7.5 2c0 4.5-7.5 10-7.5 10S4.5 14 4.5 9.5a4 4 0 0 1 7.5-2z'],
  },
  {
    name: 'sign-out',
    category: 'actions',
    shapes: [
      'M4 5.5L10 4v16l-6-1.5v-13z',
      'M10 4h3a1 1 0 0 1 1 1v3',
      'M14 16v3a1 1 0 0 1-1 1h-3',
      'M12.5 12h7.5',
      'M17 9l3 3-3 3',
    ],
    mirrorInRtl: true,
  },
  {
    name: 'mail',
    category: 'actions',
    shapes: [rect(3, 5, 18, 14), 'M4 7l8 6 8-6'],
  },
  {
    name: 'phone',
    category: 'actions',
    shapes: [
      'M5 4h3.5l1.5 4.5-2.25 1.5a11 11 0 0 0 6.25 6.25l1.5-2.25 4.5 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
    ],
  },
  {
    name: 'apps',
    category: 'actions',
    shapes: [
      dot(5.5, 5.5, 1.5),
      dot(12, 5.5, 1.5),
      dot(18.5, 5.5, 1.5),
      dot(5.5, 12, 1.5),
      dot(12, 12, 1.5),
      dot(18.5, 12, 1.5),
      dot(5.5, 18.5, 1.5),
      dot(12, 18.5, 1.5),
      dot(18.5, 18.5, 1.5),
    ],
  },

  // Status and messages
  {
    name: 'info',
    category: 'status',
    shapes: [ring, 'M12 11v6', dot(12, 7.5)],
  },
  {
    name: 'success',
    category: 'status',
    shapes: [ring, 'M8 12.5l2.5 2.5L16 9.5'],
  },
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
  {
    name: 'notification-off',
    category: 'status',
    shapes: [
      'M8.5 6.1A6 6 0 0 1 18 11v4',
      'M6.5 8.6A6 6 0 0 0 6 11v5l-1.5 2H16',
      'M10 21a2 2 0 0 0 4 0',
      'M4 4l16 16',
    ],
  },
  {
    name: 'flag',
    category: 'status',
    shapes: ['M5 21V4', 'M5 4h12l-2.5 4.5L17 13H5'],
  },
  {
    name: 'comment',
    category: 'status',
    shapes: [bubble, 'M8 8.5h8', 'M8 12h5'],
  },
  {
    name: 'hourglass',
    category: 'status',
    shapes: ['M5 3h14', 'M5 21h14', 'M7 3v4a5 5 0 0 0 10 0V3', 'M7 21v-4a5 5 0 0 1 10 0v4'],
  },
  {
    name: 'in-progress',
    category: 'status',
    shapes: [ring, { d: 'M12 7a5 5 0 0 1 0 10z', fill: true }],
  },
  { name: 'blocked', category: 'status', shapes: [ring, 'M5.6 5.6l12.8 12.8'] },
  {
    name: 'help',
    category: 'status',
    shapes: [bubble, 'M9.5 8a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.3', dot(12, 14.5)],
  },

  // Navigation
  { name: 'chevron-down', category: 'navigation', shapes: ['M6 9l6 6 6-6'] },
  { name: 'chevron-up', category: 'navigation', shapes: ['M6 15l6-6 6 6'] },
  {
    name: 'chevron-left',
    category: 'navigation',
    shapes: ['M15 6l-6 6 6 6'],
    mirrorInRtl: true,
  },
  {
    name: 'chevron-right',
    category: 'navigation',
    shapes: ['M9 6l6 6-6 6'],
    mirrorInRtl: true,
  },
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
  {
    name: 'home',
    category: 'navigation',
    shapes: ['M4 11l8-7 8 7', 'M6 9.5V20h4v-6h4v6h4V9.5'],
  },
  {
    name: 'menu',
    category: 'navigation',
    shapes: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  },
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
  {
    name: 'arrow-up',
    category: 'navigation',
    shapes: ['M12 19V5', 'M6 11l6-6 6 6'],
  },
  {
    name: 'arrow-down',
    category: 'navigation',
    shapes: ['M12 5v14', 'M6 13l6 6 6-6'],
  },
  {
    name: 'expand',
    category: 'navigation',
    shapes: ['M14 4h6v6', 'M20 4l-6 6', 'M10 20H4v-6', 'M4 20l6-6'],
  },
  {
    name: 'collapse',
    category: 'navigation',
    shapes: ['M20 4l-6 6', 'M14 5v5h5', 'M4 20l6-6', 'M10 19v-5H5'],
  },
  {
    name: 'chevron-double-left',
    category: 'navigation',
    shapes: ['M18 6l-6 6 6 6', 'M12 6l-6 6 6 6'],
    mirrorInRtl: true,
  },
  {
    name: 'chevron-double-right',
    category: 'navigation',
    shapes: ['M6 6l6 6-6 6', 'M12 6l6 6-6 6'],
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
  {
    name: 'document-pdf',
    category: 'documents',
    shapes: [
      'M6 9V4a1 1 0 0 1 1-1h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1',
      pageFold,
      rect(3, 11, 12, 6),
      'M6.5 13v2M9 13v2M11.5 13v2',
    ],
  },
  {
    name: 'spreadsheet',
    category: 'documents',
    shapes: [page, pageFold, rect(8.5, 11, 7, 7, 0), 'M8.5 14.5h7', 'M12 11v7'],
  },
  {
    name: 'folder-open',
    category: 'documents',
    shapes: ['M4 19V6a1 1 0 0 1 1-1h4.5l2 2H18a1 1 0 0 1 1 1v2', 'M4 19l3-9h14l-3 9H4z'],
  },
  {
    name: 'archive',
    category: 'documents',
    shapes: [rect(3, 4, 18, 4), 'M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8', 'M10 12h4'],
  },
  {
    name: 'image',
    category: 'documents',
    shapes: [rect(3, 4, 18, 16), circle(8.5, 9.5, 1.5), 'M3 17l5-5 4 4 3-3 6 6'],
  },
  {
    name: 'template',
    category: 'documents',
    shapes: [rect(4, 4, 16, 16), 'M4 9h16', 'M10 9v11'],
  },
  {
    name: 'signature',
    category: 'documents',
    shapes: [
      'M3.5 19h17',
      'M4 9l3 3M7 9l-3 3',
      'M10 15c1.5-5 3-7.5 4-6.5s-1.5 6.5 0 6.5 2-2.5 3-2.5 1 2.5 3 2.5',
    ],
  },

  // Finance and invoices
  {
    name: 'invoice',
    category: 'finance',
    shapes: [page, pageFold, 'M15 11a3.5 3.5 0 1 0 0 6', 'M8.5 14h4.5'],
  },
  {
    name: 'receipt',
    category: 'finance',
    shapes: [
      'M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z',
      'M9 7.5h6',
      'M9 11h6',
      'M9 14.5h3.5',
    ],
  },
  {
    name: 'payment',
    category: 'finance',
    shapes: [
      'M20 12V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h9',
      'M3 10h17',
      'M15 18h6',
      'M18.5 15.5L21 18l-2.5 2.5',
    ],
    mirrorInRtl: true,
  },
  {
    name: 'credit-card',
    category: 'finance',
    shapes: [rect(3, 5, 18, 14), 'M3 10h18', 'M6.5 15h3'],
  },
  {
    name: 'bank',
    category: 'finance',
    shapes: ['M3.5 9L12 4l8.5 5h-17z', 'M6 11.5V17M10 11.5V17M14 11.5V17M18 11.5V17', 'M3.5 20h17'],
  },
  {
    name: 'cash',
    category: 'finance',
    shapes: [rect(3, 6, 18, 12), circle(12, 12, 2.5), dot(6.5, 12, 0.75), dot(17.5, 12, 0.75)],
  },
  {
    name: 'wallet',
    category: 'finance',
    shapes: [
      'M4 6.5V18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5.5A1.5 1.5 0 0 1 4 6.5zm0 0A1.5 1.5 0 0 1 5.5 5H17v3',
      dot(16, 13.5),
    ],
  },
  {
    name: 'currency',
    category: 'finance',
    shapes: [ring, 'M15.5 8.5a4.5 4.5 0 1 0 0 7', 'M7.5 11h5', 'M7.5 13h5'],
  },
  {
    name: 'percent',
    category: 'finance',
    shapes: ['M18.5 5.5l-13 13', circle(7.5, 7.5, 2), circle(16.5, 16.5, 2)],
  },
  {
    name: 'calculator',
    category: 'finance',
    shapes: [
      rect(5, 3, 14, 18),
      rect(8, 6, 8, 3.5, 0),
      dot(8.5, 13),
      dot(12, 13),
      dot(15.5, 13),
      dot(8.5, 17),
      dot(12, 17),
      dot(15.5, 17),
    ],
  },
  {
    name: 'ledger',
    category: 'finance',
    shapes: ['M5 19.5V5a1 1 0 0 1 1-1h13v14H6.5a1.5 1.5 0 0 0 0 3H19', 'M9 8h6', 'M9 11.5h6'],
  },
  {
    name: 'tax',
    category: 'finance',
    shapes: [page, pageFold, 'M14.5 11.5l-5 6', dot(9.75, 12), dot(14.25, 17)],
  },
  {
    name: 'budget',
    category: 'finance',
    shapes: [
      'M3 19.5h18',
      rect(4, 15.5, 9, 4, 2),
      rect(4, 11.5, 9, 4, 2),
      rect(4, 7.5, 9, 4, 2),
      circle(17, 15.5, 3.5),
    ],
  },

  // Purchasing and sales
  {
    name: 'cart',
    category: 'sales',
    shapes: [
      'M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.4',
      circle(9, 19, 1.5),
      circle(17, 19, 1.5),
    ],
  },
  {
    name: 'basket',
    category: 'sales',
    shapes: [
      'M3 10h18',
      'M4.5 10l1.4 8.2a1 1 0 0 0 1 .8h10.2a1 1 0 0 0 1-.8l1.4-8.2',
      'M7.5 10l3-5.5',
      'M16.5 10l-3-5.5',
      'M10 13.5v2.5M14 13.5v2.5',
    ],
  },
  {
    name: 'purchase-order',
    category: 'sales',
    shapes: [
      'M8 9V4a1 1 0 0 1 1-1h7l4 4v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1',
      'M16 3v4h4',
      'M3 14h10',
      'M10 11l3 3-3 3',
    ],
    mirrorInRtl: true,
  },
  {
    name: 'sales-order',
    category: 'sales',
    shapes: [
      'M16 9V7l-4-4H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1',
      'M12 3v4h4',
      'M9 14h12',
      'M18 11l3 3-3 3',
    ],
    mirrorInRtl: true,
  },
  {
    name: 'quote',
    category: 'sales',
    shapes: [page, pageFold, 'M9 11h3.5l2.5 2.5-2.5 2.5H9z'],
  },
  {
    name: 'contract',
    category: 'sales',
    shapes: [page, pageFold, 'M9 11h6', 'M8.5 17c1-2 2-2 2.5-.5s1.5 1.5 4.5-.5'],
  },
  {
    name: 'product',
    category: 'sales',
    shapes: ['M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z', 'M4 7.5l8 4.5 8-4.5', 'M12 12v9'],
  },
  {
    name: 'price-tag',
    category: 'sales',
    shapes: [
      'M4 5a1 1 0 0 1 1-1h7l8.3 8.3a1 1 0 0 1 0 1.4l-6.6 6.6a1 1 0 0 1-1.4 0L4 12V5z',
      dot(8.5, 8.5, 1.25),
    ],
  },
  {
    name: 'discount',
    category: 'sales',
    shapes: [ring, 'M15 9l-6 6', dot(9.5, 9.5), dot(14.5, 14.5)],
  },
  {
    name: 'supplier',
    category: 'sales',
    shapes: ['M3 20V11l5 3.5V11l5 3.5V11l5 3.5V4h3v16z'],
  },
  {
    name: 'customer',
    category: 'sales',
    shapes: [
      circle(9, 8, 3.5),
      'M3 20a6 6 0 0 1 9.5-4.9',
      'M17.5 14a1.8 1.8 0 0 1 3.2 1.2c0 2-3.2 4.3-3.2 4.3s-3.2-2.3-3.2-4.3a1.8 1.8 0 0 1 3.2-1.2z',
    ],
  },
  {
    name: 'handshake',
    category: 'sales',
    shapes: [
      'M2.5 7.5H6l3.5-2 3 1.5',
      'M21.5 7.5H18l-3-1.5-4.5 4a1.5 1.5 0 0 0 2 2.2l2.5-2 4.5 4.5h2',
      'M2.5 14.5H5l4.5 4.5a1.4 1.4 0 0 0 2-2',
      'M11.5 17l1 1a1.4 1.4 0 0 0 2-2l1 1a1.4 1.4 0 0 0 2-2l-1.5-1.5',
    ],
  },

  // Warehouse and shipping
  {
    name: 'warehouse',
    category: 'logistics',
    shapes: ['M3 20V9l9-5 9 5v11', 'M7 20v-7h10v7', 'M7 16.5h10'],
  },
  {
    name: 'box',
    category: 'logistics',
    shapes: ['M4 8l2-4h12l2 4H4z', 'M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8', 'M10 8v4h4V8'],
  },
  {
    name: 'pallet',
    category: 'logistics',
    shapes: ['M5 10h6v7H5z', 'M13 6h6v11h-6z', 'M3 17h18', 'M3 20h18', 'M5 17v3M12 17v3M19 17v3'],
  },
  {
    name: 'truck',
    category: 'logistics',
    shapes: [
      'M5 17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v11',
      'M9 17h6',
      'M14 9h3.5l3.5 4v3a1 1 0 0 1-1 1h-1',
      circle(7, 17, 2),
      circle(17, 17, 2),
    ],
    mirrorInRtl: true,
  },
  {
    name: 'shipping',
    category: 'logistics',
    shapes: ['M3 14h18l-2 5.5H5L3 14z', 'M6.5 14V9.5h11V14', 'M10 9.5v-4h3v4'],
  },
  {
    name: 'delivery',
    category: 'logistics',
    shapes: [rect(10, 5, 11, 13), 'M13.5 5v4h4V5', 'M3 9h4', 'M4.5 12.5h3.5', 'M3 16h4'],
    mirrorInRtl: true,
  },
  {
    name: 'barcode',
    category: 'logistics',
    shapes: ['M4.5 6v12M7.5 6v12M10 6v12M13.5 6v12M16.5 6v12M19.5 6v12'],
  },
  {
    name: 'qr-code',
    category: 'logistics',
    shapes: [
      rect(4, 4, 6, 6),
      rect(14, 4, 6, 6),
      rect(4, 14, 6, 6),
      { d: 'M14 14h2.5v2.5H14z', fill: true },
      { d: 'M17.5 17.5H20V20h-2.5z', fill: true },
      { d: 'M17.5 14H20v2.5h-2.5z', fill: true },
    ],
  },
  {
    name: 'inventory',
    category: 'logistics',
    shapes: ['M4 3v18', 'M20 3v18', 'M4 11h16', 'M4 19h16', 'M7 7h4v4H7z', 'M13 15h4.5v4H13z'],
  },
  {
    name: 'location',
    category: 'logistics',
    shapes: ['M12 21s-6.5-5.5-6.5-11a6.5 6.5 0 0 1 13 0c0 5.5-6.5 11-6.5 11z', circle(12, 10, 2.5)],
  },
  {
    name: 'route',
    category: 'logistics',
    shapes: [circle(6, 18, 2), 'M8 18h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8', circle(18, 6, 2)],
    mirrorInRtl: true,
  },
  {
    name: 'return',
    category: 'logistics',
    shapes: [rect(4, 12, 16, 8), 'M10 12v3h4v-3', 'M8 3.5l-3 3 3 3', 'M5 6.5h10a3 3 0 0 1 3 3v.5'],
    mirrorInRtl: true,
  },

  // People and organization
  {
    name: 'person',
    category: 'people',
    shapes: [circle(12, 8, 4), 'M4 20a8 8 0 0 1 16 0'],
  },
  {
    name: 'people',
    category: 'people',
    shapes: [
      circle(9, 8, 3.5),
      'M3 20a6 6 0 0 1 12 0',
      'M15.5 4.5a3.5 3.5 0 0 1 0 7',
      'M17 14.2a6 6 0 0 1 4 5.8',
    ],
  },
  {
    name: 'team',
    category: 'people',
    shapes: [
      circle(12, 7.5, 3),
      'M7 20a5 5 0 0 1 10 0',
      circle(5.5, 9.5, 2.25),
      circle(18.5, 9.5, 2.25),
      'M2.5 18.5a3.5 3.5 0 0 1 4.5-3.35',
      'M21.5 18.5a3.5 3.5 0 0 0-4.5-3.35',
    ],
  },
  {
    name: 'org-chart',
    category: 'people',
    shapes: [rect(9, 3, 6, 5), rect(3, 16, 6, 5), rect(15, 16, 6, 5), 'M12 8v4', 'M6 16v-4h12v4'],
  },
  {
    name: 'building',
    category: 'people',
    shapes: [
      'M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17',
      'M4 21h16',
      'M9.5 7h1M13.5 7h1M9.5 11h1M13.5 11h1M9.5 15h1M13.5 15h1',
      'M10.5 21v-2.5h3V21',
    ],
  },
  {
    name: 'id-card',
    category: 'people',
    shapes: [
      rect(3, 5, 18, 14),
      circle(8.5, 10.5, 2),
      'M5.5 16a3 3 0 0 1 6 0',
      'M14 10h4',
      'M14 13.5h3',
    ],
  },
  {
    name: 'role',
    category: 'people',
    shapes: [
      circle(9, 8, 3.5),
      'M3 20a6 6 0 0 1 9.5-4.9',
      'M17.5 12.5l3 1.2v2.3c0 2-1.4 3.3-3 4-1.6-.7-3-2-3-4v-2.3l3-1.2z',
    ],
  },
  {
    name: 'user-add',
    category: 'people',
    shapes: [circle(9, 8, 3.5), 'M3 20a6 6 0 0 1 12 0', 'M19 8v6', 'M16 11h6'],
  },
  {
    name: 'user-check',
    category: 'people',
    shapes: [circle(9, 8, 3.5), 'M3 20a6 6 0 0 1 12 0', 'M15.5 11l2 2 4-4'],
  },

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
  {
    name: 'calendar-date',
    category: 'time',
    shapes: [calendarFrame, 'M4 10h16', 'M8 4v4', 'M16 4v4', { d: 'M14 13.5h3v3h-3z', fill: true }],
  },
  {
    name: 'calendar-range',
    category: 'time',
    shapes: [
      calendarFrame,
      'M4 10h16',
      'M8 4v4',
      'M16 4v4',
      'M8 15h8',
      dot(8, 15, 1.25),
      dot(16, 15, 1.25),
    ],
  },
  {
    name: 'time-entry',
    category: 'time',
    shapes: [
      'M16.85 12.45A7 7 0 1 0 11.95 17.75',
      'M10 7.5V11l2 1.5',
      'M14.5 21v-2l4.5-4.5 2 2-4.5 4.5h-2z',
    ],
  },
  {
    name: 'history',
    category: 'time',
    shapes: ['M4 12a8 8 0 1 0 2.34-5.66', 'M4.5 3.5v4h4', 'M12 8v4l2.5 1.5'],
  },
  {
    name: 'timer',
    category: 'time',
    shapes: [circle(12, 13.5, 7), 'M10 3h4', 'M12 3v3.5', 'M12 13.5l3-3', 'M18 7l1.5-1.5'],
  },
  {
    name: 'schedule',
    category: 'time',
    shapes: [
      'M20 11V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6',
      'M4 10h16',
      'M8 4v4',
      'M16 4v4',
      circle(17, 17, 4),
      'M17 15.5V17l1 1',
    ],
  },

  // Settings and administration
  {
    name: 'settings',
    category: 'admin',
    shapes: [
      circle(12, 12, 3),
      'M10.3 3h3.4l.5 2.4 1.6.9 2.3-.8 1.7 3-1.8 1.6v1.8l1.8 1.6-1.7 3-2.3-.8-1.6.9-.5 2.4h-3.4l-.5-2.4-1.6-.9-2.3.8-1.7-3 1.8-1.6v-1.8L4.2 8.5l1.7-3 2.3.8 1.6-.9.5-2.4z',
    ],
  },
  {
    name: 'wrench',
    category: 'admin',
    shapes: [
      'M14.5 6.5V9l1 1H18l3.5-3.5a6 6 0 0 1-7.8 7.6L7 20a2.12 2.12 0 0 1-3-3l6-6.7A6 6 0 0 1 17.5 3z',
    ],
  },
  {
    name: 'key',
    category: 'admin',
    shapes: [circle(7.5, 16.5, 4), 'M10.3 13.7L20 4', 'M17 7l2.5 2.5', 'M14.5 9.5l2 2'],
  },
  { name: 'shield', category: 'admin', shapes: [shieldOutline] },
  {
    name: 'permission',
    category: 'admin',
    shapes: [shieldOutline, 'M9 12l2 2 4-4'],
  },
  {
    name: 'database',
    category: 'admin',
    shapes: [
      'M19 6a7 2.5 0 1 1-14 0 7 2.5 0 0 1 14 0z',
      'M5 6v12a7 2.5 0 0 0 14 0V6',
      'M5 12a7 2.5 0 0 0 14 0',
    ],
  },
  {
    name: 'server',
    category: 'admin',
    shapes: [
      rect(4, 4, 16, 7),
      rect(4, 13, 16, 7),
      dot(7.5, 7.5),
      dot(7.5, 16.5),
      'M11 7.5h5',
      'M11 16.5h5',
    ],
  },
  {
    name: 'log',
    category: 'admin',
    shapes: [rect(5, 3, 14, 18), 'M8.5 7.5h7', 'M8.5 11h7', 'M8.5 14.5h7', 'M8.5 18h4'],
  },
  {
    name: 'audit',
    category: 'admin',
    shapes: [
      'M12 21H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7l4 4v3.5',
      pageFold,
      circle(15.5, 15.5, 3),
      'M17.7 17.7L20.5 20.5',
    ],
  },
  {
    name: 'integration',
    category: 'admin',
    shapes: ['M9 3v4', 'M15 3v4', 'M6 7h12v4a6 6 0 0 1-12 0V7z', 'M12 17v4'],
  },
  {
    name: 'language',
    category: 'admin',
    shapes: [
      ring,
      'M3 12h18',
      'M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
    ],
  },
  {
    name: 'tenant',
    category: 'admin',
    shapes: [
      'M4 21V8a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v13',
      'M13 21V4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v17',
      'M3 21h18',
      'M6.5 11h2M6.5 15h2M15.5 7h2M15.5 11h2M15.5 15h2',
    ],
  },

  // Reports and charts
  {
    name: 'chart-bar',
    category: 'analytics',
    shapes: ['M4 4v15a1 1 0 0 0 1 1h15', 'M8.5 16v-4', 'M12.5 16V8', 'M16.5 16v-6'],
  },
  {
    name: 'chart-line',
    category: 'analytics',
    shapes: ['M4 4v15a1 1 0 0 0 1 1h15', 'M7.5 15l4-4 3 3 5-6'],
  },
  {
    name: 'chart-pie',
    category: 'analytics',
    shapes: ['M12 4.5a8 8 0 1 0 8 8h-8z', 'M14.5 2.5v7h7a7 7 0 0 0-7-7z'],
  },
  {
    name: 'chart-area',
    category: 'analytics',
    shapes: ['M4 4v15a1 1 0 0 0 1 1h15', 'M7.5 17v-5l3.5-3.5 3 3 4.5-4.5v10z'],
  },
  {
    name: 'kpi',
    category: 'analytics',
    shapes: ['M3 16.5a9 9 0 0 1 18 0', 'M12 16.5l4-5', dot(12, 16.5, 1.5), 'M6 19.5h12'],
  },
  {
    name: 'trend-up',
    category: 'analytics',
    shapes: ['M3 17l6-6 4 4 8-8', 'M15 7h6v6'],
    mirrorInRtl: true,
  },
  {
    name: 'trend-down',
    category: 'analytics',
    shapes: ['M3 7l6 6 4-4 8 8', 'M15 17h6v-6'],
    mirrorInRtl: true,
  },
  {
    name: 'trend-flat',
    category: 'analytics',
    shapes: ['M3 13l5-3 4 3 3-2h6', 'M18 8l3 3-3 3'],
    mirrorInRtl: true,
  },
  {
    name: 'dashboard',
    category: 'analytics',
    shapes: [rect(4, 4, 7, 9), rect(13, 4, 7, 5), rect(13, 11, 7, 9), rect(4, 15, 7, 5)],
  },
  {
    name: 'report',
    category: 'analytics',
    shapes: [page, pageFold, 'M9 17v-3', 'M12 17v-6', 'M15 17v-2'],
  },
  {
    name: 'target',
    category: 'analytics',
    shapes: [ring, circle(12, 12, 5), dot(12, 12, 1.5)],
  },
];
