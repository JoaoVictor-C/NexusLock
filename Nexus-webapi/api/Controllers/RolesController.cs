using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public RolesController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all roles with optional pagination.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetAllRoles([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var roles = await _context.Roles
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new RoleDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description
                })
                .ToListAsync();

            return Ok(roles);
        }

        /// <summary>
        /// Retrieves a specific role by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDto>> GetRoleById(int id)
        {
            var role = await _context.Roles
                .Where(r => r.RoleId == id)
                .Select(r => new RoleDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        /// <summary>
        /// Creates a new role.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<RoleDto>> CreateRole(CreateRoleDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = new Roles
            {
                RoleName = createDto.RoleName,
                Description = createDto.Description
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            var roleDto = new RoleDto
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                Description = role.Description
            };

            return CreatedAtAction(nameof(GetRoleById), new { id = role.RoleId }, roleDto);
        }

        /// <summary>
        /// Updates an existing role.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, UpdateRoleDto updateDto)
        {
            if (id != updateDto.RoleId)
            {
                return BadRequest("Role ID mismatch.");
            }

            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            role.RoleName = updateDto.RoleName;
            role.Description = updateDto.Description;

            _context.Entry(role).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a role by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RoleExists(int id) => _context.Roles.Any(r => r.RoleId == id);
    }

    // DTOs
    public class RoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string? Description { get; set; }
    }

    public class CreateRoleDto
    {
        [Required]
        [StringLength(50)]
        public string RoleName { get; set; }

        public string? Description { get; set; }
    }

    public class UpdateRoleDto
    {
        [Required]
        public int RoleId { get; set; }

        [Required]
        [StringLength(50)]
        public string RoleName { get; set; }

        public string? Description { get; set; }
    }
}