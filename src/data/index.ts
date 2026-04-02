import type { Drama, DramaData } from '../types/drama';
import rawData from './dramas.json';

export const dramaData: DramaData = rawData as DramaData;
export const dramas: Drama[] = dramaData.dramas;
