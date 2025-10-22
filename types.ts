export interface Pledge {
  id: number;
  name: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
