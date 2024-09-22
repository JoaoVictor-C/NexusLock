using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public EmployeesController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all employees with optional pagination.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAllEmployees([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var employees = await _context.Employees
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EmployeeDto
                {
                    EmployeeId = e.EmployeeId,
                    Name = e.Name,
                    FingerprintDataBase64 = e.FingerprintData != null ? Convert.ToBase64String(e.FingerprintData) : null,
                    Email = e.Email
                })
                .ToListAsync();

            return Ok(employees);
        }

        /// <summary>
        /// Retrieves a specific employee by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDto>> GetEmployeeById(int id)
        {
            var employee = await _context.Employees
                .Where(e => e.EmployeeId == id)
                .Select(e => new EmployeeDto
                {
                    EmployeeId = e.EmployeeId,
                    Name = e.Name,
                    FingerprintDataBase64 = e.FingerprintData != null ? Convert.ToBase64String(e.FingerprintData) : null,
                    Email = e.Email
                })
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return NotFound();
            }

            return Ok(employee);
        }

        /// <summary>
        /// Creates a new employee.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EmployeeDto>> PostEmployee(CreateEmployeeDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var employee = new Employees
            {
                Name = createDto.Name,
                PinCode = GenerateUniquePinCode(),
                FingerprintData = !string.IsNullOrEmpty(createDto.FingerprintDataBase64) 
                    ? Convert.FromBase64String(createDto.FingerprintDataBase64) 
                    : null
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            var employeeDto = new EmployeeDto
            {
                EmployeeId = employee.EmployeeId,
                Name = employee.Name,
                PinCode = employee.PinCode,
                FingerprintDataBase64 = employee.FingerprintData != null ? Convert.ToBase64String(employee.FingerprintData) : null,
                Email = employee.Email
            };

            return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.EmployeeId }, employeeDto);
        }

        private string GenerateUniquePinCode()
        {
            const string digits = "0123456789";
            var rng = new Random();
            string pin;
            do
            {
                pin = new string(Enumerable.Repeat(digits, 4)
                  .Select(s => s[rng.Next(s.Length)]).ToArray());
            } while (_context.Employees.Any(e => e.PinCode == pin));
            return pin;
        }

        /// <summary>
        /// Updates an existing employee.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, UpdateEmployeeDto updateDto)
        {
            if (id != updateDto.EmployeeId)
            {
                return BadRequest("Employee ID mismatch.");
            }

            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            employee.Name = updateDto.Name;
            employee.PinCode = updateDto.PinCode;
            employee.FingerprintData = !string.IsNullOrEmpty(updateDto.FingerprintDataBase64)
                ? Convert.FromBase64String(updateDto.FingerprintDataBase64)
                : employee.FingerprintData;

            _context.Entry(employee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes an employee by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmployeeExists(int id) => _context.Employees.Any(e => e.EmployeeId == id);

        [HttpPut("{id}/fingerprint")]
        public async Task<IActionResult> UpdateEmployeeFingerprint(int id, [FromBody] UpdateFingerprintDto updateDto)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            employee.FingerprintData = Convert.FromBase64String(updateDto.FingerprintDataBase64);
            _context.Entry(employee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Checks if the user is an admin.
        /// In theory if the user is authenticated, the token is valid and the user has the AdminAccess policy, the user is an admin. If not, the user is not an admin and the request is forbidden.
        /// </summary>
        [Authorize(Policy = "AdminAccess")]
        [HttpGet("isAdmin")]
        public ActionResult<bool> IsAdmin()
        {
            return Ok(true);
        }

        public class UpdateFingerprintDto
        {
            [Required]
            public string FingerprintDataBase64 { get; set; }
        }
    }

    // DTOs
    public class EmployeeDto
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public string? FingerprintDataBase64 { get; set; }
        public string PinCode { get; set; }
        public string Email { get; set; }
    }

    public class CreateEmployeeDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [StringLength(10)]
        public string? PinCode { get; set; }

        public string? FingerprintDataBase64 { get; set; }
    }

    public class UpdateEmployeeDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [StringLength(100, MinimumLength = 6)]
        public string? Password { get; set; }

        [StringLength(4, MinimumLength = 4)]
        public string? PinCode { get; set; }

        public string? FingerprintDataBase64 { get; set; }
    }
}