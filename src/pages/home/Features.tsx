import { Box, Brush, Eraser, FileJson, Palette, RotateCcw } from 'lucide-react';
import type React from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

const features = [
  {
    title: 'Advanced Annotation',
    description:
      'Seamlessly switch between brush and polygon modes for unparalleled precision.',
    icon: <Brush className="h-8 w-8 text-zinc-700" />,
  },
  {
    title: 'Intelligent Class Management',
    description:
      'Define and manage classes with unique color assignments, ensuring zero overlap.',
    icon: <Palette className="h-8 w-8 text-zinc-700" />,
  },
  {
    title: 'Robust Editing Tools',
    description:
      'Utilize powerful eraser and undo functionalities for effortless corrections.',
    icon: <Eraser className="h-8 w-8 text-zinc-700" />,
  },
  {
    title: 'Interactive Canvas',
    description:
      'Leverage Fabric.js for fluid, responsive canvas interactions across all devices.',
    icon: <Box className="h-8 w-8 text-zinc-700" />,
  },
  {
    title: 'Precision Control',
    description:
      'Fine-tune your work with our advanced undo feature, ensuring pixel-perfect results.',
    icon: <RotateCcw className="h-8 w-8 text-zinc-700" />,
  },
  {
    title: 'COCO Format Integration',
    description:
      'Seamlessly export annotations in COCO format for immediate model integration.',
    icon: <FileJson className="h-8 w-8 text-zinc-700" />,
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-zinc-900">
          Advanced Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-zinc-50 border-zinc-200">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-semibold mb-2 text-main-700">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-zinc-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
