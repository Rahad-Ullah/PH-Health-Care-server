type TOptions = {
  page?: number;
  limit?: number;
  sortOrder?: string;
  sortBy?: string;
};

type TOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortOrder: string;
  sortBy: string;
};

export const calculatePagination = (options: TOptions): TOptionsResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
