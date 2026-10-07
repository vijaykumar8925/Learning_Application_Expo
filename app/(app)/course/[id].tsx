import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CourseDetailsScreen } from '../../../src/features/details/CourseDetailsScreen';

export default function CourseDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parsedId = Number(id);

  return <CourseDetailsScreen courseId={parsedId} />;
}
