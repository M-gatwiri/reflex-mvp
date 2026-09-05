import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://reflex-mvp-1.onrender.com/api";

function DeliveryTimeline({ status }) {
  const steps = [
    {
      key: "OPEN",
      label: "Request created",
    },
    {
      key: "ASSIGNED",
      label: "Rider assigned",
    },
    {
      key: "PICKED_UP",
      label: "Picked up",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
    },
  ];

  const currentStep = steps.findIndex((step) => step.key === status);

  return (
    <div className="timeline">
      <p className="timeline-title">Delivery progress</p>

      {steps.map((step, index) => {
        const completed = index <= currentStep;

        return (
          <div
            className={`timeline-step ${
              completed ? "completed-step" : ""
            }`}
            key={step.key}
          >
            <div className="timeline-marker">
              {completed ? "✓" : index + 1}
            </div>

            <div className="timeline-content">
              <span>{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const [role, setRole] = useState("RETAILER");
  const [deliveries, setDeliveries] = useState([]);
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    itemDescription: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
  if (role === "RETAILER") {
    fetchDeliveries();
  }

  if (role === "DISPATCHER") {
    fetchDeliveries();
    fetchRiders();
  }

  if (role === "RIDER") {
    fetchDeliveries();
    fetchRiders();
  }
}, [role]);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(`${API_URL}/deliveries`);
      setDeliveries(response.data);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/riders`);
      setRiders(response.data);

      if (response.data.length > 0 && !selectedRider) {
        setSelectedRider(response.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch riders:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/deliveries`, {
        retailerId: "demo-retailer",
        ...formData,
      });

      setMessage("Delivery request created successfully!");

      setFormData({
        customerName: "",
        customerPhone: "",
        address: "",
        itemDescription: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to create delivery.");
    }
  };

  const assignRider = async (deliveryId, riderId) => {
    if (!riderId) return;

    try {
      await axios.patch(`${API_URL}/deliveries/${deliveryId}/assign`, {
        riderId,
      });

      setMessage("Rider assigned successfully!");

      fetchDeliveries();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Failed to assign rider."
      );
    }
  };

  const updateStatus = async (deliveryId, status) => {
    try {
      await axios.patch(`${API_URL}/deliveries/${deliveryId}/status`, {
        status,
      });

      setMessage(`Delivery marked as ${status.replace("_", " ").toLowerCase()}.`);

      fetchDeliveries();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Failed to update delivery."
      );
    }
  };

  const riderDeliveries = deliveries.filter(
    (delivery) => delivery.riderId === selectedRider
  );

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Reflex</h1>
          <p>Delivery coordination made visible.</p>
        </div>

        <div className="role-switcher">
          <button
            className={role === "RETAILER" ? "active-role" : ""}
            onClick={() => {
              setRole("RETAILER");
              setMessage("");
            }}
          >
            Retailer
          </button>

          <button
            className={role === "DISPATCHER" ? "active-role" : ""}
            onClick={() => {
              setRole("DISPATCHER");
              setMessage("");
            }}
          >
            Dispatcher
          </button>

          <button
            className={role === "RIDER" ? "active-role" : ""}
            onClick={() => {
              setRole("RIDER");
              setMessage("");
            }}
          >
            Rider
          </button>
        </div>
      </header>

      <main className="main-content">
        {role === "RETAILER" && (
          <>
            <section className="welcome">
              <p className="eyebrow">RETAILER DASHBOARD</p>

              <h2>Create a delivery request</h2>

              <p>
                Add the customer's delivery details and submit the request
                for dispatch.
              </p>
            </section>

            <section className="card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="customerName">Customer name</label>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    placeholder="e.g. Jane Wanjiku"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerPhone">Customer phone</label>

                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    placeholder="e.g. 0712345678"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Delivery address</label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="e.g. Westlands, Nairobi"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="itemDescription">
                    Item description
                  </label>

                  <textarea
                    id="itemDescription"
                    name="itemDescription"
                    placeholder="e.g. Samsung Galaxy A15"
                    value={formData.itemDescription}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit">Create delivery</button>
              </form>

              {message && <p className="message">{message}</p>}
            </section>
          </>
        )}

        {role === "DISPATCHER" && (
          <>
            <section className="welcome">
              <p className="eyebrow">DISPATCHER DASHBOARD</p>

              <h2>Delivery requests</h2>

              <p>
                Review requests and assign them to available riders.
              </p>
            </section>

            {message && <p className="message">{message}</p>}

            <section className="delivery-list">
              {deliveries.length === 0 ? (
                <div className="card">
                  <p>No delivery requests yet.</p>
                </div>
              ) : (
                deliveries.map((delivery) => (
                  <article className="delivery-card" key={delivery._id}>
                    <div className="delivery-header">
                      <div>
                        <h3>{delivery.customerName}</h3>
                        <p>{delivery.itemDescription}</p>
                      </div>

                      <span
                        className={`status ${delivery.status.toLowerCase()}`}
                      >
                        {delivery.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="delivery-details">
                      <p>
                        <strong>Phone:</strong>{" "}
                        {delivery.customerPhone}
                      </p>

                      <p>
                        <strong>Address:</strong>{" "}
                        {delivery.address}
                      </p>
                    </div>

                    <DeliveryTimeline status={delivery.status} />

                    {delivery.status === "OPEN" && (
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          assignRider(delivery._id, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Assign a rider
                        </option>

                        {riders.map((rider) => (
                          <option key={rider._id} value={rider._id}>
                            {rider.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {delivery.status !== "OPEN" && (
                      <p className="assigned-rider">
                        Rider: <strong>{delivery.riderName}</strong>
                      </p>
                    )}
                  </article>
                ))
              )}
            </section>
          </>
        )}

        <section className="retailer-deliveries">
  <div className="tracking-heading">
    <p className="eyebrow">TRACKING</p>

    <h2>My deliveries</h2>

    <p>
      Follow the progress of your delivery requests from creation
      to completion.
    </p>
  </div>

  {deliveries.length === 0 ? (
    <div className="card">
      <p>No deliveries created yet.</p>
    </div>
  ) : (
    <div className="delivery-list">
      {deliveries.map((delivery) => (
        <article className="delivery-card" key={delivery._id}>
          <div className="delivery-header">
            <div>
              <h3>{delivery.customerName}</h3>

              <p>{delivery.itemDescription}</p>
            </div>

            <span
              className={`status ${delivery.status.toLowerCase()}`}
            >
              {delivery.status.replace("_", " ")}
            </span>
          </div>

          <div className="delivery-details">
            <p>
              <strong>Phone:</strong>{" "}
              {delivery.customerPhone}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {delivery.address}
            </p>

            <p>
              <strong>Rider:</strong>{" "}
              {delivery.riderName || "Waiting for assignment"}
            </p>
          </div>

          <DeliveryTimeline status={delivery.status} />
        </article>
      ))}
    </div>
  )}
</section>

        {role === "RIDER" && (
          <>
            <section className="welcome">
              <p className="eyebrow">RIDER DASHBOARD</p>

              <h2>My deliveries</h2>

              <p>
                View your assigned deliveries and update their status.
              </p>
            </section>

            <section className="card rider-selector">
              <label htmlFor="rider">Viewing as</label>

              <select
                id="rider"
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
              >
                {riders.map((rider) => (
                  <option key={rider._id} value={rider._id}>
                    {rider.name}
                  </option>
                ))}
              </select>
            </section>

            {message && <p className="message">{message}</p>}

            <section className="delivery-list">
              {riderDeliveries.length === 0 ? (
                <div className="card">
                  <p>No deliveries assigned to this rider.</p>
                </div>
              ) : (
                riderDeliveries.map((delivery) => (
                  <article className="delivery-card" key={delivery._id}>
                    <div className="delivery-header">
                      <div>
                        <h3>{delivery.customerName}</h3>
                        <p>{delivery.itemDescription}</p>
                      </div>

                      <span
                        className={`status ${delivery.status.toLowerCase()}`}
                      >
                        {delivery.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="delivery-details">
                      <p>
                        <strong>Phone:</strong>{" "}
                        {delivery.customerPhone}
                      </p>

                      <p>
                        <strong>Address:</strong>{" "}
                        {delivery.address}
                      </p>
                    </div>

                    <DeliveryTimeline status={delivery.status} />

                    {delivery.status === "ASSIGNED" && (
                      <button
                        onClick={() =>
                          updateStatus(delivery._id, "PICKED_UP")
                        }
                      >
                        Mark as picked up
                      </button>
                    )}

                    {delivery.status === "PICKED_UP" && (
                      <button
                        onClick={() =>
                          updateStatus(delivery._id, "DELIVERED")
                        }
                      >
                        Mark as delivered
                      </button>
                    )}

                    {delivery.status === "DELIVERED" && (
                      <p className="completed">
                        ✓ Delivery completed
                      </p>
                    )}
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;