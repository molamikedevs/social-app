import { Models } from "appwrite"
import Loader from "./Loader"
import GridPostList from "./GridPostList"

type SearchResultProps = {
    searchPosts: Models.Document[],
    isSearchFetching: boolean,
  
}

const SearchResults = ({searchPosts, isSearchFetching}: SearchResultProps) => {

    if(isSearchFetching) return <Loader />

    if(searchPosts && searchPosts.documents.length > 0)  {
        return  <GridPostList posts={searchPosts.documents}  />
    }


  return (
    <p className="text-light-4 mt-10 text-center w-full">No result found</p>
  )
}

export default SearchResults