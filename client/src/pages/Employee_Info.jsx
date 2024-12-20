import React, { useEffect, useState } from 'react';

const Employee_Info = () => {
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        const employee_Data = localStorage.getItem('employee');
        console.log('Retrieved employee data:', employee_Data); // Add this line for debugging
        if (employee_Data) {
            setEmployee(JSON.parse(employee_Data));
        }
    }, []);

    if (!employee) {
        return <div>No employee information found.</div>;
    }

    return (
        <div className = "form">
            <h1>Employee Information</h1>
            <p>ID: {employee.employee_ID}</p>
            <p>Name: {employee.first_name} {employee.last_name}</p>
            <p>Role: {employee.role}</p>
        </div>
    );
};

export default Employee_Info;
