INSERT INTO payment (id, date, amount, "type", employee_id)
SELECT (SELECT id
        FROM payment
        ORDER BY ID DESC
        LIMIT 1) + row_num,
        now(),
        100,
        'Salary',
        employee_id
FROM (Select id as employee_id, ROW_NUMBER () OVER () as row_num
    FROM employee
    INNER JOIN (
        SELECT department_id, MAX(donation_sum) as max_employee_donation
        FROM (
            SELECT employee.*, SUM(payment.amount) as donation_sum
            FROM employee
            INNER JOIN payment
            ON payment.employee_id = employee.id
            WHERE payment.type = 'Donation'
            GROUP BY employee.id
        ) as employee
        GROUP BY employee.department_id
        ORDER BY max_employee_donation DESC
        LIMIT 1
    ) as department
    ON employee.department_id = department.department_id
) as employee;