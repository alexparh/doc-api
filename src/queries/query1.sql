SELECT employee.id, employee.name, employee.surname, employee.department_id
FROM payment
INNER JOIN (
    SELECT employee.*
    FROM (
        SELECT employee.*, AVG(payment.amount)/10 as avg_6month_salary
        FROM payment
        INNER JOIN (
            SELECT employee.*, SUM(payment.amount) as donation
            FROM payment
            INNER JOIN employee
            ON employee.id = payment.employee_id
            WHERE payment.type = 'Donation' and payment.date >= now() - INTERVAL '2 YEAR'
            GROUP BY employee.id
        ) as employee
        ON employee.id = payment.employee_id
        WHERE payment.type = 'Salary' and payment.date >= now() - INTERVAL '2 YEAR'
        GROUP BY employee.id, employee.name, employee.surname, employee.department_id, employee.donation
    ) as employee
    WHERE donation > avg_6month_salary
) as employee
ON employee.id = payment.employee_id
WHERE payment.type = 'Salary' and payment.date >= now() - INTERVAL '2 YEAR'
GROUP BY employee.id, employee.name, employee.surname, employee.department_id
ORDER BY AVG(payment.amount) ASC;