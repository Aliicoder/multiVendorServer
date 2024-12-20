export namespace ISharedControllers {
  export interface fetchSellersChunk {
    name: string
    curPage: number
    perPage: number
    sortBy: []
  }
}

export namespace IProductControllers {
  export interface IProductsChunk {
    name: string
    curPage: number 
    perPage: number 
    outOfStock: boolean
    sortBy: []
  }
  export interface IFetchSearchedProducts {
    searchValue: string
    category: string
  }
}

export namespace ICategoryControllers {
  export interface IFetchCategoriesChunk {
    name : string
    curPage: number 
    perPage: number 
    parent: string
    sortBy: []
  }  
}

