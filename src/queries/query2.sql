SELECT department.id as department_id, department.name as department_name, employee.id, employee.name, employee.surname, employee.last_salary
FROM (
    SELECT department.*, MAX(employee.avg_salary), MIN(employee.avg_salary)
    FROM department
    INNER JOIN (
        SELECT employee.*, AVG(payment.amount) as avg_salary
        FROM employee
        INNER JOIN payment
        ON payment.employee_id = employee.id
        WHERE payment.type = 'Salary' and payment.date >= now() - INTERVAL '2 YEAR'
        GROUP BY employee.id
        ) as employee
    ON employee.department_id = department.id
    GROUP BY department.id, department.name
    ORDER BY MAX(employee.avg_salary)-MIN(employee.avg_salary) DESC
) as department
LEFT JOIN (
    SELECT
        employee.*,
        ROW_NUMBER() OVER (
            PARTITION BY employee.department_id
            ORDER BY (employee.last_salary - employee.firs_salary)/employee.firs_salary*100 DESC
        ) as row_num
    FROM (
        SELECT employee.*, payment.amount as firs_salary
        FROM payment
        INNER JOIN (
            SELECT employee.*, payment.amount as last_salary
            FROM payment
            INNER JOIN (
                SELECT employee.*, MAX(payment.date) as max_date, MIN(payment.date) as min_date
                FROM payment
                INNER JOIN employee
                ON employee.id = payment.employee_id
                WHERE payment.type = 'Salary'
                GROUP BY employee.id
            ) as employee
            ON employee.id = payment.employee_id
            WHERE employee.max_date =  payment.date AND payment.type = 'Salary'
        ) as employee
        ON employee.id = payment.employee_id
        WHERE employee.min_date =  payment.date AND payment.type = 'Salary'
    ) as employee
) as employee
ON employee.department_id = department.id
WHERE row_num <= 3;