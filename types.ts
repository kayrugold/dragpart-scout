export interface CarProfile {
  year: string;
  make: string;
  model: string;
  engine: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SearchResult {
  id: string;
  timestamp: number;
  car: CarProfile;
  partQuery: string;
  aiResponseText: string;
  groundingChunks: GroundingChunk[];
}

export enum SearchStatus {
  IDLE,
  SEARCHING,
  COMPLETE,
  ERROR
}