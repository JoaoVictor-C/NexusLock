using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeRolesController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public EmployeeRolesController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all employee roles with optional pagination.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeRoleDto>>> GetAllEmployeeRoles([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var employeeRoles = await _context.EmployeeRoles
                .Include(er => er.Employee)
                .Include(er => er.Role)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(er => new EmployeeRoleDto
                {
                    EmployeeRoleId = er.EmployeeRoleId,
                    EmployeeId = er.EmployeeId,
                    EmployeeName = er.Employee != null ? er.Employee.Name : null,
                    RoleId = er.RoleId,
                    RoleName = er.Role != null ? er.Role.RoleName : null
                })
                .ToListAsync();

            return Ok(employeeRoles);
        }

        /// <summary>
        /// Retrieves a specific employee role by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeRoleDto>> GetEmployeeRoleById(int id)
        {
            var employeeRole = await _context.EmployeeRoles
                .Include(er => er.Employee)
                .Include(er => er.Role)
                .Where(er => er.EmployeeRoleId == id)
                .Select(er => new EmployeeRoleDto
                {
                    EmployeeRoleId = er.EmployeeRoleId,
                    EmployeeId = er.EmployeeId,
                    EmployeeName = er.Employee != null ? er.Employee.Name : null,
                    RoleId = er.RoleId,
                    RoleName = er.Role != null ? er.Role.RoleName : null
                })
                .FirstOrDefaultAsync();

            if (employeeRole == null)
            {
                return NotFound();
            }

            return Ok(employeeRole);
        }

        /// <summary>
        /// Creates a new employee role.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EmployeeRoleDto>> CreateEmployeeRole(CreateEmployeeRoleDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var employeeRole = new EmployeeRoles
            {
                EmployeeId = createDto.EmployeeId,
                RoleId = createDto.RoleId
            };

            _context.EmployeeRoles.Add(employeeRole);
            await _context.SaveChangesAsync();

            // Load related data
            await _context.Entry(employeeRole).Reference(er => er.Employee).LoadAsync();
            await _context.Entry(employeeRole).Reference(er => er.Role).LoadAsync();

            var employeeRoleDto = new EmployeeRoleDto
            {
                EmployeeRoleId = employeeRole.EmployeeRoleId,
                EmployeeId = employeeRole.EmployeeId,
                EmployeeName = employeeRole.Employee?.Name,
                RoleId = employeeRole.RoleId,
                RoleName = employeeRole.Role?.RoleName
            };

            return CreatedAtAction(nameof(GetEmployeeRoleById), new { id = employeeRole.EmployeeRoleId }, employeeRoleDto);
        }

        /// <summary>
        /// Updates an existing employee role.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployeeRole(int id, UpdateEmployeeRoleDto updateDto)
        {
            if (id != updateDto.EmployeeRoleId)
            {
                return BadRequest("EmployeeRole ID mismatch.");
            }

            var employeeRole = await _context.EmployeeRoles.FindAsync(id);
            if (employeeRole == null)
            {
                return NotFound();
            }

            employeeRole.EmployeeId = updateDto.EmployeeId;
            employeeRole.RoleId = updateDto.RoleId;

            _context.Entry(employeeRole).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeRoleExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes an employee role by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployeeRole(int id)
        {
            var employeeRole = await _context.EmployeeRoles.FindAsync(id);
            if (employeeRole == null)
            {
                return NotFound();
            }

            _context.EmployeeRoles.Remove(employeeRole);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmployeeRoleExists(int id) => _context.EmployeeRoles.Any(er => er.EmployeeRoleId == id);
    }

    // DTOs
    public class EmployeeRoleDto
    {
        public int EmployeeRoleId { get; set; }
        public int? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public int? RoleId { get; set; }
        public string? RoleName { get; set; }
    }

    public class CreateEmployeeRoleDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int RoleId { get; set; }
    }

    public class UpdateEmployeeRoleDto
    {
        [Required]
        public int EmployeeRoleId { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int RoleId { get; set; }
    }
}