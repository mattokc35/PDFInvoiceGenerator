import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { Listing } from "@/types/listing";
import { generatePDF } from "@/helpers/generatePDFInvoice";

interface ListingDetailsModalProps {
  show: boolean;
  onHide: () => void;
  listingData: Listing | undefined;
  error: string;
  email: string;
  name: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
}

const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  show,
  onHide,
  listingData,
  error,
  email,
  name,
  setEmail,
  setName,
}) => {
  const [nameError, setNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<string>("");

  useEffect(() => {
    if (show) {
      //clear inputs when the modal opens
      setName("");
      setEmail("");
      setNameError("");
      setEmailError("");
      setActionStatus(""); //clear status on modal open
    }
  }, [show, setName, setEmail]);

  const validateForm = () => {
    let isValid = true;

    if (name.trim() === "") {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    if (email.trim() === "") {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    } else {
      setEmailError("");
    }

    return isValid;
  };

  const handleGeneratePDF = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setActionStatus("");

      try {
        if (listingData) {
          await generatePDF(listingData, name, email);
          setActionStatus(
            "PDF generated successfully! Download will begin momentarily..."
          );
        } else {
          setActionStatus("Failed to generate PDF. Listing data unavailable");
        }
      } catch (err) {
        setActionStatus("Failed to generate PDF.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendEmail = async () => {
    setActionStatus(
      `The email feature is still under construction. Please click "Download PDF" to get your invoice!`
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (e.target.value.trim() !== "") {
      setNameError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (e.target.value.trim() !== "") {
      setEmailError("");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Listing Invoice Request Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {listingData && (
          <>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <h6 style={{ marginBottom: "0.5rem" }}>
                <strong>Listing Name:</strong> {listingData.listingTitle}
              </h6>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#333",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>Price:</strong> ${listingData.sellingPrice}
              </p>
              <p style={{ fontSize: "1rem", color: "#333" }}>
                <strong>Location:</strong>{" "}
                {listingData.addressCity !== "NA" && listingData.addressCity}{" "}
                {listingData.addressState !== "NA" && listingData.addressState}
                {listingData.addressZip !== "00000" &&
                  (listingData.addressCity !== "NA" ||
                    listingData.addressState) &&
                  ` ${listingData.addressZip}`}
              </p>
            </div>
          </>
        )}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "0.8rem", color: "#f97316" }}>
              Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange}
              isInvalid={!!nameError}
            />
            <Form.Control.Feedback type="invalid">
              {nameError}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: "0.8rem", color: "#f97316" }}>
              Email
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              isInvalid={!!emailError}
            />
            <Form.Control.Feedback type="invalid">
              {emailError}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
        {actionStatus && (
          <p
            style={{
              color: isLoading
                ? "black"
                : actionStatus.startsWith("Failed")
                ? "red"
                : "green",
            }}
          >
            {actionStatus}
          </p>
        )}
        {isLoading && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleGeneratePDF}
          style={{ backgroundColor: "#f97316", borderColor: "#f97316" }}
          disabled={isLoading}
        >
          {isLoading && actionStatus.includes("PDF")
            ? "Generating PDF..."
            : "Download PDF"}
        </Button>
        <Button
          variant="primary"
          onClick={handleSendEmail}
          style={{ backgroundColor: "#f97316", borderColor: "#f97316" }}
          disabled={isLoading}
        >
          {isLoading && actionStatus.includes("Email")
            ? "Sending Email..."
            : "Send Email"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ListingDetailsModal;
