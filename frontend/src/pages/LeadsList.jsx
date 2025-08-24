import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { 
  ModuleRegistry, 
  ClientSideRowModelModule,
  NumberFilterModule,
  TextFilterModule
} from 'ag-grid-community';
import api from '../services/api';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './LeadsList.css';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  NumberFilterModule,
  TextFilterModule
]);

function LeadsList({ user, setUser }) {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});
  const gridRef = useRef();
  const navigate = useNavigate();

  const columnDefs = [
    { field: 'first_name', headerName: 'First Name', sortable: true, filter: true },
    { field: 'last_name', headerName: 'Last Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    { field: 'company', headerName: 'Company', sortable: true, filter: true },
    { field: 'phone', headerName: 'Phone' },
    { field: 'city', headerName: 'City', filter: true },
    { field: 'state', headerName: 'State', filter: true },
    { 
      field: 'source', 
      headerName: 'Source',
      filter: true,
      cellRenderer: (params) => {
        return <span className={`source-badge ${params.value}`}>{params.value}</span>;
      }
    },
    { 
      field: 'status', 
      headerName: 'Status',
      filter: true,
      cellRenderer: (params) => {
        return <span className={`status-badge ${params.value}`}>{params.value}</span>;
      }
    },
    { field: 'score', headerName: 'Score', filter: 'agNumberColumnFilter' },
    { 
      field: 'lead_value', 
      headerName: 'Value',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `$${params.value?.toFixed(2) || '0.00'}`
    },
    { 
      field: 'is_qualified', 
      headerName: 'Qualified',
      cellRenderer: (params) => params.value ? '✓' : '✗'
    },
    {
      headerName: 'Actions',
      cellRenderer: (params) => {
        return (
          <div className="action-buttons">
            <button onClick={() => handleEdit(params.data._id)}>Edit</button>
            <button onClick={() => handleDelete(params.data._id)} className="delete-btn">Delete</button>
          </div>
        );
      }
    }
  ];

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationData.page,
        limit: paginationData.limit
      };
      
      if (Object.keys(filters).length > 0) {
        params.filters = JSON.stringify(filters);
      }

      const response = await api.get('/leads', { params });

      setRowData(response.data.data);
      setPaginationData({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [paginationData.page, paginationData.limit, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleEdit = (id) => {
    navigate(`/leads/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (error) {
        alert('Error deleting lead');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPaginationData(prev => ({ ...prev, page: newPage }));
  };

  const onFilterChanged = () => {
    const filterModel = gridRef.current.api.getFilterModel();
    const newFilters = {};

    Object.keys(filterModel).forEach(field => {
      const filter = filterModel[field];
      let operator;
      let value = filter.filter;

      switch (filter.type) {
        case 'contains':
        case 'notContains':
          operator = filter.type;
          break;
        case 'equals':
        case 'notEqual':
          operator = filter.type;
          break;
        case 'startsWith':
        case 'endsWith':
          operator = filter.type;
          break;
        case 'lessThan':
          operator = 'lt';
          break;
        case 'lessThanOrEqual':
          operator = 'lte';
          break;
        case 'greaterThan':
          operator = 'gt';
          break;
        case 'greaterThanOrEqual':
          operator = 'gte';
          break;
        case 'inRange':
          operator = 'between';
          value = [filter.filter, filter.filterTo];
          break;
        default:
          console.warn(`Unknown filter type: ${filter.type}`);
          return;
      }
      
      newFilters[field] = { operator, value };
    });

    setFilters(newFilters);
    setPaginationData(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="leads-container">
      <header className="leads-header">
        <h1>Lead Management System</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user.name}</span>
          <button onClick={() => navigate('/leads/new')} className="new-lead-btn">
            + New Lead
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="leads-content">
        <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={false}
            onFilterChanged={onFilterChanged}
            animateRows={true}
            rowSelection="single"
          />
        </div>

        <div className="pagination">
          <button 
            onClick={() => handlePageChange(paginationData.page - 1)}
            disabled={paginationData.page === 1}
          >
            Previous
          </button>
          <span>
            Page {paginationData.page} of {paginationData.totalPages} 
            (Total: {paginationData.total} leads)
          </span>
          <button 
            onClick={() => handlePageChange(paginationData.page + 1)}
            disabled={paginationData.page === paginationData.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadsList;