import { MakeupLook } from '../types';
import { LANDMARKS } from '../constants';

export const MAKEUP_LOOKS: MakeupLook[] = [
  {
    id: 'natural-glow',
    name: 'Natural Glow',
    description: 'A fresh, everyday look that enhances your natural features.',
    thumbnail: 'https://picsum.photos/seed/makeup1/400/300',
    steps: [
      {
        id: 'ng-foundation',
        title: 'Foundation',
        description: 'Apply a light layer of foundation to even out your skin tone.',
        productType: 'foundation',
        color: '#f3e5ab',
        opacity: 0.3,
        landmarks: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
        style: 'fill',
      },
      {
        id: 'ng-blush',
        title: 'Soft Blush',
        description: 'Add a touch of pink to the apples of your cheeks.',
        productType: 'blush',
        color: '#ffb6c1',
        opacity: 0.4,
        landmarks: [...LANDMARKS.CHEEKS_LEFT, ...LANDMARKS.CHEEKS_RIGHT],
        style: 'fill',
      },
      {
        id: 'ng-lip',
        title: 'Nude Lip',
        description: 'Finish with a moisturizing nude lipstick.',
        productType: 'lipstick',
        color: '#e9967a',
        opacity: 0.6,
        landmarks: LANDMARKS.LIPS,
        style: 'fill',
      }
    ]
  },
  {
    id: 'smokey-eye',
    name: 'Classic Smokey Eye',
    description: 'A dramatic look perfect for evening events.',
    thumbnail: 'https://picsum.photos/seed/makeup2/400/300',
    steps: [
      {
        id: 'se-shadow',
        title: 'Dark Eyeshadow',
        description: 'Apply dark grey or black shadow to the outer corners of your eyes.',
        productType: 'eyeshadow',
        color: '#2f4f4f',
        opacity: 0.5,
        landmarks: [...LANDMARKS.LEFT_EYE, ...LANDMARKS.RIGHT_EYE],
        style: 'fill',
      },
      {
        id: 'se-liner',
        title: 'Eyeliner',
        description: 'Define your lash line with a sharp black liner.',
        productType: 'eyeliner',
        color: '#000000',
        opacity: 0.8,
        landmarks: [...LANDMARKS.LEFT_EYE, ...LANDMARKS.RIGHT_EYE],
        style: 'outline',
      },
      {
        id: 'se-brows',
        title: 'Bold Brows',
        description: 'Fill in your brows for a structured look.',
        productType: 'brows',
        color: '#4b3621',
        opacity: 0.4,
        landmarks: [...LANDMARKS.LEFT_BROW, ...LANDMARKS.RIGHT_BROW],
        style: 'fill',
      }
    ]
  },
  {
    id: 'bold-glam',
    name: 'Bold Glam',
    description: 'High contrast look with sharp contour and red lips.',
    thumbnail: 'https://picsum.photos/seed/makeup3/400/300',
    steps: [
      {
        id: 'bg-contour',
        title: 'Contour',
        description: 'Define your cheekbones and jawline.',
        productType: 'contour',
        color: '#8b4513',
        opacity: 0.3,
        landmarks: LANDMARKS.CONTOUR_CHEEKS,
        style: 'fill',
      },
      {
        id: 'bg-highlight',
        title: 'Highlight',
        description: 'Brighten the bridge of your nose and high points of cheeks.',
        productType: 'highlight',
        color: '#fffaf0',
        opacity: 0.5,
        landmarks: [...LANDMARKS.NOSE_BRIDGE, 116, 345],
        style: 'fill',
      },
      {
        id: 'bg-lip',
        title: 'Red Lip',
        description: 'Apply a classic matte red lipstick.',
        productType: 'lipstick',
        color: '#ff0000',
        opacity: 0.8,
        landmarks: LANDMARKS.LIPS,
        style: 'fill',
      }
    ]
  }
];
