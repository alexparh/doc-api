INSERT INTO payment (id, date, amount, "type", employee_id)
SELECT (SELECT id
        FROM payment
        ORDER BY ID DESC
        LIMIT 1) + row_num,
        now(),
        ROUND((donation/(SELECT SUM(payment.amount)
        FROM payment
        WHERE payment.type = 'Donation') * 10000)::numeric, 2),
        'Salary',
        employee_id
FROM (
  SELECT employee.id as employee_id, SUM(payment.amount) as donation, ROW_NUMBER () OVER () as row_num
  FROM employee
  INNER JOIN payment
  ON employee.id = payment.employee_id
  WHERE payment.type = 'Donation'
  GROUP BY employee.id
  HAVING SUM(payment.amount)>100
) as employee;