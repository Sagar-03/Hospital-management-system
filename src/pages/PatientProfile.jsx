// /mnt/data/PatientProfile.jsx
import React, { useMemo, useState, useRef } from "react";
import "../styles/patient.css";


function UpcomingBookingBanner({ bookings = {}, doctors = [], onCancel = () => {} }) {
  // parse strings like "2025-12-01 10:00 AM" into a Date object
  const parseSlot = (slotStr) => {
    if (!slotStr) return null;
    const ampmMatch = slotStr.match(/^(?<date>\d{4}-\d{2}-\d{2})\s+(?<time>\d{1,2}:\d{2})\s*(?<ampm>AM|PM)?$/i);
    if (ampmMatch?.groups) {
      const { date, time, ampm } = ampmMatch.groups;
      let [hh, mm] = time.split(":").map(Number);
      if (ampm) {
        const up = ampm.toUpperCase();
        if (up === "PM" && hh !== 12) hh += 12;
        if (up === "AM" && hh === 12) hh = 0;
      }
      const [y, m, d] = date.split("-").map(Number);
      return new Date(y, m - 1, d, hh, mm);
    }
    const d = new Date(slotStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const nearest = useMemo(() => {
    const bookedIds = Object.keys(bookings).filter((id) => bookings[id]);
    if (!bookedIds.length) return null;

    const bookedDocs = bookedIds
      .map((id) => doctors.find((d) => Number(d.id) === Number(id)))
      .filter(Boolean)
      .map((d) => ({ ...d, parsed: parseSlot(d.nextSlot) }))
      .filter((d) => d.parsed && !isNaN(d.parsed.getTime()));

    if (!bookedDocs.length) return null;

    const now = Date.now();
    bookedDocs.sort((a, b) => a.parsed - b.parsed);

    const future = bookedDocs.find((d) => d.parsed.getTime() >= now);
    return future || bookedDocs[0];
  }, [bookings, doctors]);

  if (!nearest) return null;

  const dt = nearest.parsed;
  const dateStr = dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const timeStr = dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div className="card notification-card" role="status" aria-live="polite" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p className="notification-title" style={{ margin: 0 }}>Upcoming Appointment</p>
        <p className="notification-text" style={{ margin: 0 }}>
          You have an appointment with <strong>{nearest.name}</strong> on <strong>{dateStr}</strong> at <strong>{timeStr}</strong>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="notification-tag"
          title="Cancel booking"
          onClick={() => onCancel(Number(nearest.id))}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}


const initialPatient = {
  id: 1,
  name: "Ravi Sharma singh",
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
  { id: 1, date: "2025-01-05", time: "10:30 AM", doctor: "Dr. Arjun Mehta", department: "Pulmonology", type: "Follow-up", status: "previous" },
  { id: 2, date: "2025-01-20", time: "04:00 PM", doctor: "Dr. Nisha Verma", department: "Neurology", type: "Consultation", status: "upcoming" },
  { id: 3, date: "2025-02-01", time: "11:15 AM", doctor: "Dr. Rohan Kapoor", department: "General Medicine", type: "Routine Check-up", status: "upcoming" }
];

const doctorList = [
  { id: 1, name: "Dr. Arjun Mehta", type: "Pulmonology", qualification: "MBBS, MD (Pulmonology)", nextSlot: "2025-12-01 10:00 AM" },
  { id: 2, name: "Dr. Nisha Verma", type: "Neurology", qualification: "MBBS, DM (Neurology)", nextSlot: "2025-11-29 02:00 PM" },
  { id: 3, name: "Dr. Rohan Kapoor", type: "General Medicine", qualification: "MBBS, MD (Gen Med)", nextSlot: "2025-11-30 11:15 AM" },
  { id: 4, name: "Dr. Meera Joshi", type: "Dermatology", qualification: "MBBS, MD (Derm)", nextSlot: "2025-12-02 09:30 AM" }
];

export default function PatientProfile() {
  const [patient, setPatient] = useState(initialPatient);
  const [appointments] = useState(initialAppointments);
  const [filter, setFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialPatient);
  const [showUpcomingBanner, setShowUpcomingBanner] = useState(true);

  // Sidebar & booking
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [doctors] = useState(doctorList);

  // BOOKINGS: allow multiple bookings -> map doctorId -> true
  const [bookings, setBookings] = useState({}); // e.g. {1: true, 3: true}

  // uploaded files per doctor (doctorId -> File[])
  const [uploadedFilesMap, setUploadedFilesMap] = useState({});
  const fileInputRef = useRef(null);
  const sidebarFileInputRef = useRef(null);

  const nextUpcoming = useMemo(() => appointments.find((a) => a.status === "upcoming"), [appointments]);

  const filteredAppointments = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const visibleDoctors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchesName = !term || d.name.toLowerCase().includes(term);
      const matchesType = selectedType === "all" || d.type === selectedType;
      return matchesName && matchesType;
    });
  }, [doctors, searchTerm, selectedType]);

  // profile edit handlers (unchanged)
  const handleEditToggle = () => { setFormData(patient); setIsEditing(true); };
  const handleFormChange = (e) => { const { name, value } = e.target; setFormData((p) => ({ ...p, [name]: value })); };
  const handleSaveProfile = (e) => { e.preventDefault(); setPatient(formData); setIsEditing(false); };
  const handleCancelEdit = () => { setIsEditing(false); setFormData(patient); };
  const handleSOS = () => alert("🚨 Emergency SOS triggered!");

  const openSidebar = () => { setSearchTerm(""); setSelectedType("all"); setSidebarOpen(true); };
  const closeSidebar = () => setSidebarOpen(false);

  // BOOK: allow booking multiple doctors; no global single-book constraint
  const handleBookSlot = (doctor) => {
    if (bookings[doctor.id]) return; // guard
    setBookings((prev) => ({ ...prev, [doctor.id]: true }));
    window.alert(`Appointment Booked with ${doctor.name}`);
    // keep sidebar open so user can upload under that doctor's card
  };

  const handleCancelBooking = (doctorId) => {
    setBookings((prev) => { const next = { ...prev }; delete next[doctorId]; return next; });
    window.alert("Booking cancelled");
  };

  // Sidebar file selection (per doctor)
  const handleSidebarFiles = (doctorId, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadedFilesMap((prev) => ({ ...prev, [doctorId]: [...(prev[doctorId] || []), ...files] }));
  };

  // Right column upload - attach to a chosen doctor if user picks one; otherwise to "general"
  const handleRightColumnFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const key = "general";
    setUploadedFilesMap((prev) => ({ ...prev, [key]: [...(prev[key] || []), ...files] }));
  };

  const fileDownloadUrl = (file) => {
    try { return URL.createObjectURL(file); } catch { return "#"; }
  };

  const removeUploadedFile = (doctorId, idx) => {
    setUploadedFilesMap((prev) => {
      const arr = [...(prev[doctorId] || [])];
      arr.splice(idx, 1);
      return { ...prev, [doctorId]: arr };
    });
  };

  return (
    <div className="page-container">
      {/* HEADER - restored to earlier (no Book button here) */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">
            View and manage your personal details, medical history and
            appointments.
          </p>
        </div>

        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleEditToggle}>Edit Profile</button>
          <button className="btn btn-sos" onClick={handleSOS}>🚨 Emergency SOS</button>
        </div>
      </div>

      {/* {nextUpcoming && showUpcomingBanner && (
        <div className="card notification-card">
          <div>
            <p className="notification-title">Upcoming Appointment</p>
            <p className="notification-text">
              You have an appointment with <strong>{nextUpcoming.doctor}</strong> on <strong>{nextUpcoming.date}</strong> at <strong>{nextUpcoming.time}</strong>.
            </p>
          </div>
          <div className="notification-right">
            <button className="notification-tag" onClick={() => setShowUpcomingBanner(false)}>×</button>
          </div>
        </div>
      )} */}

      {/* UpcomingBookingBanner shows the nearest booked appointment (if any) */}
      <UpcomingBookingBanner bookings={bookings} doctors={doctors} onCancel={handleCancelBooking} />

      <div className="profile-grid">
        {/* PROFILE CARD (left) */}
        <div className="card profile-main-card">
          <div className="profile-header">
            <div className="profile-avatar">{patient.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="profile-name">{patient.name}</h2>
              <p className="profile-id">Medical ID: <span>{patient.medicalId}</span></p>
            </div>

            {/* NEW: booking button in yellow area (top-right of card) */}
            <div className="profile-top-right-cta">
              <button className="btn btn-yellow" onClick={openSidebar}>Book Appointment</button>
            </div>
          </div>

          {/* rest of profile unchanged */}
          {!isEditing ? (
            <>
              <div className="profile-info-grid">
                <div className="profile-info-item"><span className="label">Age</span><span className="value">{patient.age}</span></div>
                <div className="profile-info-item"><span className="label">Gender</span><span className="value">{patient.gender}</span></div>
                <div className="profile-info-item"><span className="label">Blood Group</span><span className="chip chip-accent">{patient.bloodGroup}</span></div>
                <div className="profile-info-item"><span className="label">Last Visit</span><span className="value">{patient.lastVisit}</span></div>
              </div>

              <div className="profile-contact">
                <h3 className="section-title">Contact Details</h3>
                <div className="profile-contact-grid">
                  <div><span className="label">Phone</span><p className="value">{patient.phone}</p></div>
                  <div><span className="label">Email</span><p className="value">{patient.email}</p></div>
                  <div><span className="label">Address</span><p className="value">{patient.address}</p></div>
                </div>
              </div>

              <div className="profile-contact" style={{ marginTop: 18 }}>
                <h3 className="section-title">Medical History</h3>
                <p className="section-text">{patient.history}</p>
              </div>
              <div className="profile-contact" style={{ marginTop: 12 }}>
                <h3 className="section-title">Doctor&apos;s Notes</h3>
                <p className="section-text">{patient.notes}</p>
              </div>
            </>
          ) : (
            <form className="edit-form" onSubmit={handleSaveProfile}>
              {/* edit form omitted for brevity (same as earlier) */}
              <h3 className="section-title">Edit Profile</h3>
              <div className="edit-form-grid">
                <label><span className="label">Full Name</span><input className="input input-full" name="name" value={formData.name} onChange={handleFormChange} /></label>
                <label><span className="label">Age</span><input className="input input-full" name="age" value={formData.age} onChange={handleFormChange} /></label>
                <label><span className="label">Gender</span><input className="input input-full" name="gender" value={formData.gender} onChange={handleFormChange} /></label>
                <label><span className="label">Blood Group</span><input className="input input-full" name="bloodGroup" value={formData.bloodGroup} onChange={handleFormChange} /></label>
                <label><span className="label">Phone</span><input className="input input-full" name="phone" value={formData.phone} onChange={handleFormChange} /></label>
                <label><span className="label">Email</span><input className="input input-full" name="email" value={formData.email} onChange={handleFormChange} /></label>
                <label className="full-width"><span className="label">Address</span><input className="input input-full" name="address" value={formData.address} onChange={handleFormChange} /></label>
                <label className="full-width"><span className="label">Allergies</span><input className="input input-full" name="allergies" value={formData.allergies} onChange={handleFormChange} /></label>
              </div>
              <div className="edit-actions">
                <button type="button" className="btn btn-light-outline" onClick={handleCancelEdit}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-side-column">
          <div className="card">
            <h3 className="section-title">Allergies</h3>
            {patient.allergies ? <div className="chip-list">{patient.allergies.split(",").map((a, i) => <span key={i} className="chip chip-warning">{a.trim()}</span>)}</div> : <p className="section-text">No allergies recorded.</p>}
          </div>

          <div className="card">
            <div className="card-header-row">
              <h3 className="section-title">Appointments</h3>
              <select className="input input-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="previous">Previous</option>
              </select>
            </div>

            <br />

            {filteredAppointments.length === 0 ? <p className="section-text">No appointments to show.</p> : (
              <ul className="appointment-list">
                {filteredAppointments.map((appt) => (
                  <li key={appt.id} className={`appointment-item ${appt.status === "upcoming" ? "appointment-upcoming" : "appointment-previous"}`}>
                    <div>
                      <p className="appointment-title">{appt.type} • {appt.department}</p>
                      <p className="appointment-sub">{appt.date} at {appt.time} — {appt.doctor}</p>
                    </div>
                    <span className={appt.status === "upcoming" ? "chip chip-accent" : "chip chip-muted"}>{appt.status === "upcoming" ? "Upcoming" : "Previous"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Uploaded files (grouped by doctor + general) */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="section-title">Uploaded files</h3>
              <span className="section-text">Grouped</span>
            </div>

            <div style={{ marginTop: 12 }}>

              {/* list general files */}
              <div>
                {Object.keys(uploadedFilesMap).length === 0 ? (
                  <p className="section-text">No files uploaded yet.</p>
                ) : (
                  Object.keys(uploadedFilesMap).map((key) => {
                    const list = uploadedFilesMap[key] || [];
                    const label = key === "general" ? "General" : (doctors.find(d => d.id === Number(key))?.name || `Doctor ${key}`);
                    if (!list.length) return null;
                    return (
                      <div key={key} style={{ marginBottom: 10 }}>
                        <strong className="section-text">{label}</strong>
                        <ul style={{ paddingLeft: 18 }}>
                          {list.map((f, idx) => (
                            <li key={idx} style={{ marginBottom: 6 }}>
                              <a href={fileDownloadUrl(f)} download={f.name} onClick={() => {
                                const url = fileDownloadUrl(f);
                                setTimeout(() => URL.revokeObjectURL(url), 2000);
                              }}>{f.name}</a>
                              <button className="btn btn-light-outline small-inline" style={{ marginLeft: 8 }} onClick={() => removeUploadedFile(key, idx)}>Remove</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`doctor-sidebar ${sidebarOpen ? "open" : ""}`} role="dialog" aria-hidden={!sidebarOpen}>
        <div className="sidebar-inner">
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close">×</button>
          <h2 style={{ marginTop: 6 }}>Book a Doctor</h2>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input placeholder="Search by doctor name..." className="input input-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select className="input" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All</option>
              {[...new Set(doctors.map(d => d.type))].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            {visibleDoctors.length === 0 ? <p className="section-text">No doctors found.</p> : (
              <ul className="doctor-list">
                {visibleDoctors.map((d) => {
                  const isBooked = !!bookings[d.id];
                  return (
                    <li key={d.id} className="doctor-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{d.name}</div>
                          <div className="section-text" style={{ marginTop: 4 }}>{d.type} • {d.qualification}</div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div className="section-text">Next slot</div>
                          {isBooked ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <button className="btn btn-muted" disabled>Booked</button>
                              <button className="btn btn-danger" onClick={() => handleCancelBooking(d.id)}>Cancel Booking</button>
                            </div>
                          ) : (
                            <button className="btn btn-primary" onClick={() => handleBookSlot(d)}>{d.nextSlot}</button>
                          )}
                        </div>
                      </div>

                      {/* If this doctor is booked, show upload controls under this card */}
                      {isBooked && (
                        <div style={{ marginTop: 12, borderTop: "1px dashed #e6edf3", paddingTop: 12 }}>
                          <h4 style={{ margin: "0 0 8px 0" }}>Upload files for {d.name}</h4>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button className="btn btn-primary" onClick={() => sidebarFileInputRef.current && sidebarFileInputRef.current.click()}>Choose Files</button>
                            <input ref={sidebarFileInputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => handleSidebarFiles(d.id, e)} />
                          </div>

                          <div style={{ marginTop: 10 }}>
                            {(uploadedFilesMap[d.id] || []).length === 0 ? (
                              <p className="section-text">No files selected for this appointment.</p>
                            ) : (
                              <ul style={{ paddingLeft: 18 }}>
                                {uploadedFilesMap[d.id].map((f, idx) => (
                                  <li key={idx} style={{ marginBottom: 6 }}>
                                    <a href={fileDownloadUrl(f)} download={f.name} onClick={() => {
                                      const url = fileDownloadUrl(f);
                                      setTimeout(() => URL.revokeObjectURL(url), 2000);
                                    }}>{f.name}</a>
                                    <button className="btn btn-light-outline small-inline" style={{ marginLeft: 8 }} onClick={() => removeUploadedFile(d.id, idx)}>Remove</button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
