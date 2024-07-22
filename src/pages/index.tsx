import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { fetchListing } from "@/network/networkRequests";
import { validateUrl, getListingIdFromUrl } from "@/helpers/helperFunctions";
import { Listing } from "@/types/listing";
import ListingDetailsModal from "@/components/ListingDetailsModal";

const Home = () => {
  const [listingUrl, setListingUrl] = useState<string>("");
  const [listingData, setListingData] = useState<Listing | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string>("");
  const [urlError, setUrlError] = useState<string>("");
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);

  const handleFetchListing = async () => {
    setError("");
    if (listingUrl.length === 0) {
      setUrlError("URL cannot be empty");
      setIsValidUrl(false);
      return;
    }
    if (!validateUrl(listingUrl)) {
      setUrlError("Invalid URL format");
      setIsValidUrl(false);
      return;
    }
    setUrlError(""); 
    setIsValidUrl(true);

    const id = getListingIdFromUrl(listingUrl);
    try {
      const data = await fetchListing(id);
      if (data) {
        setIsValidUrl(true);
        setListingData(data);
        setModalIsOpen(true); //open the modal only if data is successfully fetched
      } else {
        setError("No listing data found.");
        setUrlError("");
        setIsValidUrl(false);
        setModalIsOpen(false); 
      }
    } catch (error) {
      setError("Failed to fetch listing data.");
      setModalIsOpen(false); //ensure modal is closed
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchListing();
  };

  return (
    <Container
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Request PDF Invoice</h2>
      <Form
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: "500px" }}
      >
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: "0.8rem", color: "#f97316" }}>
            Enter listing URL
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter listing URL, ex: https://www.withgarage.com/listing/{id-here}"
            value={listingUrl}
            onChange={(e) => {
              const url = e.target.value;
              setListingUrl(url);
              setError("");
              if (url.length === 0) {
                setUrlError("URL cannot be empty");
                setIsValidUrl(false);
              } else if (!validateUrl(url)) {
                setUrlError("Invalid URL format");
                setIsValidUrl(false);
              } else {
                setUrlError("");
                setIsValidUrl(true);
              }
            }}
            isInvalid={!!urlError}
            style={{
              marginBottom: "10px",
              borderColor: isValidUrl ? "green" : undefined,
            }}
          />
          <Form.Control.Feedback type="invalid">
            {urlError}
          </Form.Control.Feedback>
          {isValidUrl && !urlError && (
            <div style={{ color: "green", marginTop: "5px" }}>
              URL is valid!
            </div>
          )}
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "#f97316",
            borderColor: "#f97316",
          }}
        >
          Get Listing
        </Button>
      </Form>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {listingData && (
        <ListingDetailsModal
          show={modalIsOpen}
          onHide={() => setModalIsOpen(false)}
          listingData={listingData}
          error={error}
          email={email}
          name={name}
          setEmail={setEmail}
          setName={setName}
        />
      )}
    </Container>
  );
};

export default Home;
