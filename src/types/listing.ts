export interface Listing {
  id: string;
  createdAt: string;
  updatedAt: string;
  itemBrand: string;
  itemCategory: number;
  listingTitle: string;
  listingDescription: string;
  sellingPrice: number;
  isShippable: boolean;
  imageUrls: string[];
  listingStatus: number;
  tags: string[];
  categories: number[];
  itemWears?: any[];
  scrapedLink: string | null;
  itemAge: number;
  itemCondition: string;
  itemLength: number | null;
  itemWidth: number | null;
  itemHeight: number | null;
  itemWeight: number | null;
  addressPrimary: string;
  addressSecondary?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  userId: string;
}
