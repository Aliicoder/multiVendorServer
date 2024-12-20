export namespace IChatSockets {
  export interface IAdminSellersChat {
    _id: string;
    recentMessage: string;
    seller:{
      _id: string;
      avatar: string;
      businessName?: string;
    }
  }
  export interface ISellerAdminsChat {
    _id: string;
    recentMessage: string;
    admin:{
      _id: string;
      avatar: string;
      business?: string;
    }
  }
  export interface ISellerClientsChat {
    _id: string;
    recentMessage: string;
    client:{
      _id: string;
      avatar: string;
      name: string;
    }
  }
  export interface IClientSellersChat {
    _id: string;
    recentMessage: string;
    seller:{
      _id: string;
      avatar: string;
      businessName: string;
    }
  }
}
