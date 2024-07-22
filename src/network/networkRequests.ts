const BASE_URL = "https://garage-backend.onrender.com";

const request = async (
  url: string,
  method: string = "GET",
  headers: Record<string, string> = { "Content-Type": "application/json" },
  body?: any
) => {
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error making request:", error);
    throw error;
  }
};

export const fetchListing = async (id: string) => {
  try {
    const data = await request(
      BASE_URL + "/getListing",
      "POST",
      { "Content-Type": "application/json" },
      { id }
    );
    return data.result.listing;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
};
