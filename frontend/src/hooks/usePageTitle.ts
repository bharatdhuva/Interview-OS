import { useEffect } from 'react';

const BASE_TITLE = 'Interview OS';

export const usePageTitle = (page?: string) => {
  useEffect(() => {
    document.title = page ? `${page} | ${BASE_TITLE}` : BASE_TITLE;
  }, [page]);
};
