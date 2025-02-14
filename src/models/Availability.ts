export interface AvailabilityStatus {
    [key: string]: {
      [service: string]: string;
    };
  }