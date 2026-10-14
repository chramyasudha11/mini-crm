
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/customers";

function App() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "LEAD",
  });
  const [editingId, setEditingId] = useState(null);

  async function loadCustomers() {
    try {
      setError("");
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load customers");
      setCustomers(await response.json());
    } catch {
      setError("Cannot connect to the backend. Check that Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Could not save customer. Check the details and try again.");
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "LEAD",
      });
      setEditingId(null);
      await loadCustomers();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  function editCustomer(customer) {
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      status: customer.status || "LEAD",
    });
    setEditingId(customer.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCustomer(id) {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete customer");
      await loadCustomers();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = [
      customer.name,
      customer.email,
      customer.company,
      customer.status,
    ].some((value) =>
      (value || "").toLowerCase().includes(search.toLowerCase())
    );

    const matchesStatus =
      statusFilter === "ALL" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const leads = customers.filter((c) => c.status === "LEAD").length;
  const customersCount = customers.filter((c) => c.status === "CUSTOMER").length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">✦</span> MiniCRM</div>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">♙ &nbsp; Customers</div>
        <div className="sidebar-bottom">
          <div className="avatar">R</div>
          <div><strong>CRM Workspace</strong><small>Customer management</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="breadcrumb">Workspace / </span>Dashboard</div>
          <div className="online"><span /> System online</div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h1>Customer dashboard</h1>
              <p className="subtitle">Manage your relationships, all in one place.</p>
            </div>
            <button className="primary-button" onClick={() => {
              setEditingId(null);
              setForm({ name: "", email: "", phone: "", company: "", status: "LEAD" });
              document.getElementById("customer-form").scrollIntoView({ behavior: "smooth" });
            }}>＋ Add customer</button>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="stats">
            <div className="stat-card">
              <div className="stat-top"><span>Total contacts</span><span className="stat-icon purple">♙</span></div>
              <div className="stat-number">{customers.length}</div>
              <div className="stat-note">All saved contacts</div>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span>Active leads</span><span className="stat-icon orange">↗</span></div>
              <div className="stat-number">{leads}</div>
              <div className="stat-note">Potential customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span>Customers</span><span className="stat-icon green">✓</span></div>
              <div className="stat-number">{customersCount}</div>
              <div className="stat-note">Converted customers</div>
            </div>
          </div>

          <section className="panel" id="customer-form">
            <div className="panel-heading">
              <div>
                <h2>{editingId ? "Edit customer" : "Add a customer"}</h2>
                <p>Enter the contact details below.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="customer-form">
              <label>Full name *
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Alex Morgan" required />
              </label>
              <label>Email address
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="alex@company.com" />
              </label>
              <label>Phone number
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </label>
              <label>Company
                <input name="company" value={form.company} onChange={handleChange} placeholder="Company name" />
              </label>
              <label>Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="LEAD">Lead</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button">{editingId ? "Save changes" : "Create customer"}</button>
                {editingId && <button type="button" className="secondary-button" onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", email: "", phone: "", company: "", status: "LEAD" });
                }}>Cancel</button>}
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="list-heading">
              <div><h2>All customers</h2><p>{filteredCustomers.length} contacts in your workspace</p></div>
              <div className="filters">
                <input
                  className="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="⌕  Search customers..."
                />

                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All statuses</option>
                  <option value="LEAD">Leads</option>
                  <option value="CUSTOMER">Customers</option>
                </select>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>NAME</th><th>COMPANY</th><th>EMAIL</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  s{loading ? (
                    <tr><td colSpan="5" className="empty">Loading customers...</td></tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr><td colSpan="5" className="empty">No customers found. Add a customer to get started.</td></tr>
                  ) : filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td><div className="person"><span className="person-avatar">{(customer.name || "?").charAt(0).toUpperCase()}</span><strong>{customer.name}</strong></div></td>
                      <td>{customer.company || "—"}</td>
                      <td>{customer.email || "—"}</td>
                      <td><span className={`status ${customer.status === "CUSTOMER" ? "customer-status" : "lead-status"}`}>{customer.status || "LEAD"}</span></td>
                      <td><div className="actions">
                        <button className="text-button" onClick={() => editCustomer(customer)}>Edit</button>
                        <button className="text-button danger" onClick={() => deleteCustomer(customer.id)}>Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <footer>MiniCRM · Simple relationships, better business.</footer>
        </section>
      </main>
    </div>
  );
}

export default App;

