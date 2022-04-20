import { useQuery } from 'react-query';

async function fetchCategoriesRequest() {
    const response = await fetch('/api/categories');
    const data = await response.json();
    const { categories } = data;
    return categories;
}

export default function useCategories() {
    const {
        data: categories,
        isLoading,
        isError,
    } = useQuery('categories', fetchCategoriesRequest);

    return {
        categories,
        isLoading,
        isError,
    };
}

