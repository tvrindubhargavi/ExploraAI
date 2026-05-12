export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  interests?: string[];
  travelStats?: {
    placesVisited: number;
    distanceTraveled: number;
  };
  coins?: number;
  homeCity?: string;
  wishlist?: string[];
  plannedTrips?: {
    destination: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface Trip {
  id: string;
  ownerId: string;
  title: string;
  destination: string;
  budget: number;
  startDate: string;
  endDate: string;
  preferences: string[];
  itinerary: {
    day: number;
    activities: string[];
  }[];
  members: string[];
  createdAt: any;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  imageUrl: string;
  content: string;
  locationName: string;
  likes: number;
  likedBy: string[];
  createdAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  members: string[];
  lastMessage?: string;
  updatedAt: any;
}
