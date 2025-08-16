export interface ProductType {
    cname: string;
    email: string;
    pname: string;
    pimg: string;
    rating: number;
    stock: boolean;
    photo: string;
    id: number | string;
    created: Date;
    description: string;
  }

export interface OverdueCandidate {
  sessionId: number;
  name: string;
  created_at: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
