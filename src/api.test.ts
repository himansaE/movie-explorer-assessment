import axios from 'axios';

jest.mock('axios', () => ({
  __esModule: true,
  default: { create: jest.fn(), isAxiosError: jest.fn() },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const originalToken = process.env.REACT_APP_TMDB_API_TOKEN;
afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  process.env.REACT_APP_TMDB_API_TOKEN = originalToken;
});

test('movie requests go directly to TMDb with the public demo token', async () => {
  process.env.REACT_APP_TMDB_API_TOKEN = 'disposable-test-token';
  const get = jest.fn().mockResolvedValue({ data: { page: 1, results: [] } });
  mockedAxios.create.mockReturnValue({ get } as unknown as ReturnType<typeof axios.create>);
  const api = await import('./api');
  await api.fetchMoviePage('now_playing', 1, '');
  await api.fetchMoviePage('trending', 2, '');
  await api.fetchMoviePage('upcoming', 1, '');
  await api.fetchMoviePage('top_rated', 1, '');
  await api.fetchMoviePage('search', 1, 'Dune');
  await api.fetchMovieDetails(42);
  expect(mockedAxios.create).toHaveBeenCalledWith(expect.objectContaining({
    baseURL: 'https://api.themoviedb.org/3',
    headers: expect.objectContaining({ Authorization: 'Bearer disposable-test-token' }),
  }));
  expect(get).toHaveBeenNthCalledWith(1, '/movie/now_playing', expect.any(Object));
  expect(get).toHaveBeenNthCalledWith(2, '/trending/movie/week', expect.objectContaining({ params: expect.objectContaining({ page: 2 }) }));
  expect(get).toHaveBeenNthCalledWith(3, '/discover/movie', expect.objectContaining({ params: expect.objectContaining({ 'primary_release_date.gte': expect.any(String) }) }));
  expect(get).toHaveBeenNthCalledWith(4, '/movie/top_rated', expect.any(Object));
  expect(get).toHaveBeenNthCalledWith(5, '/search/movie', expect.objectContaining({ params: expect.objectContaining({ query: 'Dune', page: 1 }) }));
  expect(get).toHaveBeenNthCalledWith(6, '/movie/42', expect.any(Object));
});
