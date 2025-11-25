import React, { useMemo, useState } from "react";
import "../styles/patient.css";

const initialPatient = {
  id: 1,
  name: "Ravi Sharma",
  medicalId: "MED-1024",
  age: 26,
  gender: "Male",
  phone: "+91 98765 43210",
  email: "ravi.sharma@example.com",
  address: "Pune, Maharashtra, India",
  bloodGroup: "B+",
  allergies: "Penicillin, Dust",
  lastVisit: "2025-01-10",
  history: "Mild asthma; periodic migraine; seasonal allergies.",
  notes:
    "Responds well to inhaler treatment. Stress and lack of sleep aggravate migraine."
};

const initialAppointments = [
  {
    id: 1,
    date: "2025-01-05",
    time: "10:30 AM",
    doctor: "Dr. Arjun Mehta",
    department: "Pulmonology",
    type: "Follow-up",
    status: "previous"
  },
  {
    id: 2,
    date: "2025-01-20",
    time: "04:00 PM",
    doctor: "Dr. Nisha Verma",
    department: "Neurology",
    type: "Consultation",
    status: "upcoming"
  },
  {
    id: 3,
    date: "2025-02-01",
    time: "11:15 AM",
    doctor: "Dr. Rohan Kapoor",
    department: "General Medicine",
    type: "Routine Check-up",
    status: "upcoming"
  }
];

export default function PatientProfile() {
  const [patient, setPatient] = useState(initialPatient);
  const [appointments] = useState(initialAppointments);
  const [filter, setFilter] = useState("all"); // all | upcoming | previous
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialPatient);
  const [showUpcomingBanner, setShowUpcomingBanner] = useState(true);

  // Notification for next upcoming appointment
  const nextUpcoming = useMemo(
    () => appointments.find((a) => a.status === "upcoming"),
    [appointments]
  );

  const filteredAppointments = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const handleEditToggle = () => {
    setFormData(patient);
    setIsEditing(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setPatient(formData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(patient);
  };

  const handleSOS = () => {
    alert(
      "🚨 Emergency SOS triggered!\nIn a real app this would notify the hospital & share your details."
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">
            View and manage your personal details, medical history and
            appointments.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleEditToggle}>
            Edit Profile
          </button>
          <button className="btn btn-sos" onClick={handleSOS}>
            🚨 Emergency SOS
          </button>
        </div>
      </div>

      {/* Notification for upcoming appointment */}
      {nextUpcoming && showUpcomingBanner && (
        <div className="card notification-card">
          <div>
            <p className="notification-title">Upcoming Appointment</p>
            <p className="notification-text">
              You have an appointment with{" "}
              <strong>{nextUpcoming.doctor}</strong> on{" "}
              <strong>{nextUpcoming.date}</strong> at{" "}
              <strong>{nextUpcoming.time}</strong> (
              {nextUpcoming.department}).
            </p>
          </div>
          <div className="notification-right">
            <button
              className="notification-tag"
              onClick={() => setShowUpcomingBanner(false)}
              aria-label="Dismiss reminder"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="profile-grid">
        {/* LEFT: Profile details */}
        <div className="card profile-main-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {patient.name?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div>
              <h2 className="profile-name">{patient.name}</h2>
              <p className="profile-id">
                Medical ID: <span>{patient.medicalId}</span>
              </p>
            </div>
          </div>

          {/* View / Edit */}
          {!isEditing ? (
            <>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="label">Age</span>
                  <span className="value">{patient.age}</span>
                </div>
                <div className="profile-info-item">
                  <span className="label">Gender</span>
                  <span className="value">{patient.gender}</span>
                </div>
                <div className="profile-info-item">
                  <span className="label">Blood Group</span>
                  <span className="chip chip-accent">
                    {patient.bloodGroup || "Not updated"}
                  </span>
                </div>
                <div className="profile-info-item">
                  <span className="label">Last Visit</span>
                  <span className="value">{patient.lastVisit || "—"}</span>
                </div>
              </div>

              <div className="profile-contact">
                <h3 className="section-title">Contact Details</h3>
                <div className="profile-contact-grid">
                  <div>
                    <span className="label">Phone</span>
                    <p className="value">{patient.phone}</p>
                  </div>
                  <div>
                    <span className="label">Email</span>
                    <p className="value">{patient.email}</p>
                  </div>
                  <div>
                    <span className="label">Address</span>
                    <p className="value">{patient.address}</p>
                  </div>
                </div>
              </div>

              <div className="profile-contact" style={{ marginTop: "18px" }}>
                <h3 className="section-title">Medical History</h3>
                <p className="section-text">{patient.history}</p>
              </div>
              <div className="profile-contact" style={{ marginTop: "12px" }}>
                <h3 className="section-title">Doctor&apos;s Notes</h3>
                <p className="section-text">{patient.notes}</p>
              </div>
            </>
          ) : (
            <form className="edit-form" onSubmit={handleSaveProfile}>
              <h3 className="section-title">Edit Profile</h3>
              <div className="edit-form-grid">
                <label>
                  <span className="label">Full Name</span>
                  <input
                    className="input input-full"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  <span className="label">Age</span>
                  <input
                    className="input input-full"
                    name="age"
                    value={formData.age}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  <span className="label">Gender</span>
                  <input
                    className="input input-full"
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  <span className="label">Blood Group</span>
                  <input
                    className="input input-full"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  <span className="label">Phone</span>
                  <input
                    className="input input-full"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  <span className="label">Email</span>
                  <input
                    className="input input-full"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </label>

                <label className="full-width">
                  <span className="label">Address</span>
                  <input
                    className="input input-full"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                  />
                </label>

                <label className="full-width">
                  <span className="label">Allergies</span>
                  <input
                    className="input input-full"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              <div className="edit-actions">
                <button
                  type="button"
                  className="btn btn-light-outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT: Appointments + filters */}
        <div className="profile-side-column">
          <div className="card">
            <div className="card-header-row">
              <h3 className="section-title">Appointments</h3>
              {/* Dropdown filter (working) */}
              <select
                className="input input-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="previous">Previous</option>
              </select>
            </div>

            {filteredAppointments.length === 0 ? (
              <p className="section-text">No appointments to show.</p>
            ) : (
              <ul className="appointment-list">
                {filteredAppointments.map((appt) => (
                  <li
                    key={appt.id}
                    className={`appointment-item ${
                      appt.status === "upcoming"
                        ? "appointment-upcoming"
                        : "appointment-previous"
                    }`}
                  >
                    <div>
                      <p className="appointment-title">
                        {appt.type} • {appt.department}
                      </p>
                      <p className="appointment-sub">
                        {appt.date} at {appt.time} — {appt.doctor}
                      </p>
                    </div>
                    <span
                      className={
                        appt.status === "upcoming"
                          ? "chip chip-accent"
                          : "chip chip-muted"
                      }
                    >
                      {appt.status === "upcoming" ? "Upcoming" : "Previous"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Allergies card */}
          <div className="card">
            <h3 className="section-title">Allergies</h3>
            {patient.allergies ? (
              <div className="chip-list">
                {patient.allergies.split(",").map((a, idx) => (
                  <span key={idx} className="chip chip-warning">
                    {a.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="section-text">No allergies recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
