using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public PermissionsController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all permissions with optional pagination.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAllPermissions([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var permissions = await _context.Permissions
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PermissionDto
                {
                    PermissionId = p.PermissionId,
                    PermissionKey = p.PermissionKey,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(permissions);
        }

        /// <summary>
        /// Retrieves a specific permission by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PermissionDto>> GetPermissionById(int id)
        {
            var permission = await _context.Permissions
                .Where(p => p.PermissionId == id)
                .Select(p => new PermissionDto
                {
                    PermissionId = p.PermissionId,
                    PermissionKey = p.PermissionKey,
                    Description = p.Description
                })
                .FirstOrDefaultAsync();

            if (permission == null)
            {
                return NotFound();
            }

            return Ok(permission);
        }

        /// <summary>
        /// Creates a new permission.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PermissionDto>> CreatePermission(CreatePermissionDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var permission = new Permissions
            {
                PermissionKey = createDto.PermissionKey,
                Description = createDto.Description
            };

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();

            var permissionDto = new PermissionDto
            {
                PermissionId = permission.PermissionId,
                PermissionKey = permission.PermissionKey,
                Description = permission.Description
            };

            return CreatedAtAction(nameof(GetPermissionById), new { id = permission.PermissionId }, permissionDto);
        }

        /// <summary>
        /// Updates an existing permission.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePermission(int id, UpdatePermissionDto updateDto)
        {
            if (id != updateDto.PermissionId)
            {
                return BadRequest("Permission ID mismatch.");
            }

            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return NotFound();
            }

            permission.PermissionKey = updateDto.PermissionKey;
            permission.Description = updateDto.Description;

            _context.Entry(permission).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermissionExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a permission by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermission(int id)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return NotFound();
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PermissionExists(int id) => _context.Permissions.Any(p => p.PermissionId == id);
    }

    // DTOs
    public class PermissionDto
    {
        public int PermissionId { get; set; }
        public string PermissionKey { get; set; }
        public string? Description { get; set; }
    }

    public class CreatePermissionDto
    {
        [Required]
        [StringLength(50)]
        public string PermissionKey { get; set; }

        public string? Description { get; set; }
    }

    public class UpdatePermissionDto
    {
        [Required]
        public int PermissionId { get; set; }

        [Required]
        [StringLength(50)]
        public string PermissionKey { get; set; }

        public string? Description { get; set; }
    }
}