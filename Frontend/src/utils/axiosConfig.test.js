describe("API base URL", () => {
  const original = process.env.REACT_APP_API_BASE_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.REACT_APP_API_BASE_URL;
    else process.env.REACT_APP_API_BASE_URL = original;
    jest.resetModules();
  });

  test("defaults to localhost for development", () => {
    delete process.env.REACT_APP_API_BASE_URL;
    jest.resetModules();
    expect(require("./axiosConfig").base_url).toBe("http://localhost:5000/api/");
  });

  test("supports a deployed API with or without a trailing slash", () => {
    for (const url of ["https://api.example.org/api", "https://api.example.org/api///"]) {
      process.env.REACT_APP_API_BASE_URL = url;
      jest.resetModules();
      expect(require("./axiosConfig").base_url).toBe("https://api.example.org/api/");
    }
  });
});
