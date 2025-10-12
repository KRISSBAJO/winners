export interface NationalChurch {
  _id: string;
  name: string;
  code: string;
  nationalPastor: string;
  address?: {
    street?: string; city?: string; state?: string; country?: string; zip?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  _id: string;
  nationalChurchId: string; // ref => NationalChurch._id
  name: string;
  code: string;
  districtPastor: string;
  address?: {
    street?: string; city?: string; state?: string; country?: string; zip?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Church {
  _id: string;
  districtId: string; // ref => District._id
  name: string;
  churchId: string;
  pastor: string;
  address?: {
    street?: string; city?: string; state?: string; country?: string; zip?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}


export type NationalOverview = {
  info: {
    _id: string;
    name: string;
    code: string;
    nationalPastor?: string;
    address?: any;
  };
  totals: { districts: number; churches: number; pastors: number };
  districts: Array<{
    _id: string;
    name: string;
    code: string;
    districtPastor?: string;
    address?: any;
    churchCount: number;
    churches: Array<{
      _id: string;
      name: string;
      churchId: string;
      pastor?: string;
      contactEmail?: string;
      contactPhone?: string;
      address?: any;
      districtId: string;
    }>;
  }>;
};



/** Light input types for create/update forms */
export type CreateNationalInput = Pick<NationalChurch, "name" | "code" | "nationalPastor"> & Partial<NationalChurch>;
export type UpdateNationalInput = Partial<CreateNationalInput>;

export type CreateDistrictInput = Pick<District, "name" | "code" | "districtPastor" | "nationalChurchId"> & Partial<District>;
export type UpdateDistrictInput = Partial<CreateDistrictInput>;

export type CreateChurchInput = Pick<Church, "name" | "churchId" | "pastor" | "districtId"> & Partial<Church>;
export type UpdateChurchInput = Partial<CreateChurchInput>;
