using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolePermissionsController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public RolePermissionsController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all role permissions with optional pagination.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolePermissionDto>>> GetAllRolePermissions([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var rolePermissions = await _context.RolePermissions
                .Include(rp => rp.Role)
                .Include(rp => rp.Permission)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(rp => new RolePermissionDto
                {
                    RolePermissionId = rp.RolePermissionId,
                    RoleId = rp.RoleId,
                    RoleName = rp.Role != null ? rp.Role.RoleName : null,
                    PermissionId = rp.PermissionId,
                    PermissionKey = rp.Permission != null ? rp.Permission.PermissionKey : null
                })
                .ToListAsync();

            return Ok(rolePermissions);
        }

        /// <summary>
        /// Retrieves a specific role permission by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<RolePermissionDto>> GetRolePermissionById(int id)
        {
            var rolePermission = await _context.RolePermissions
                .Include(rp => rp.Role)
                .Include(rp => rp.Permission)
                .Where(rp => rp.RolePermissionId == id)
                .Select(rp => new RolePermissionDto
                {
                    RolePermissionId = rp.RolePermissionId,
                    RoleId = rp.RoleId,
                    RoleName = rp.Role != null ? rp.Role.RoleName : null,
                    PermissionId = rp.PermissionId,
                    PermissionKey = rp.Permission != null ? rp.Permission.PermissionKey : null
                })
                .FirstOrDefaultAsync();

            if (rolePermission == null)
            {
                return NotFound();
            }

            return Ok(rolePermission);
        }

        /// <summary>
        /// Creates a new role permission.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<RolePermissionDto>> CreateRolePermission(CreateRolePermissionDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate existence of Role and Permission
            var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == createDto.RoleId);
            var permissionExists = await _context.Permissions.AnyAsync(p => p.PermissionId == createDto.PermissionId);

            if (!roleExists || !permissionExists)
            {
                return BadRequest("Invalid RoleId or PermissionId.");
            }

            var rolePermission = new RolePermissions
            {
                RoleId = createDto.RoleId,
                PermissionId = createDto.PermissionId
            };

            _context.RolePermissions.Add(rolePermission);
            await _context.SaveChangesAsync();

            // Load related data
            await _context.Entry(rolePermission).Reference(rp => rp.Role).LoadAsync();
            await _context.Entry(rolePermission).Reference(rp => rp.Permission).LoadAsync();

            var rolePermissionDto = new RolePermissionDto
            {
                RolePermissionId = rolePermission.RolePermissionId,
                RoleId = rolePermission.RoleId,
                RoleName = rolePermission.Role?.RoleName,
                PermissionId = rolePermission.PermissionId,
                PermissionKey = rolePermission.Permission?.PermissionKey
            };

            return CreatedAtAction(nameof(GetRolePermissionById), new { id = rolePermission.RolePermissionId }, rolePermissionDto);
        }

        /// <summary>
        /// Updates an existing role permission.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRolePermission(int id, UpdateRolePermissionDto updateDto)
        {
            if (id != updateDto.RolePermissionId)
            {
                return BadRequest("RolePermission ID mismatch.");
            }

            var rolePermission = await _context.RolePermissions.FindAsync(id);
            if (rolePermission == null)
            {
                return NotFound();
            }

            // Validate existence of Role and Permission
            var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == updateDto.RoleId);
            var permissionExists = await _context.Permissions.AnyAsync(p => p.PermissionId == updateDto.PermissionId);

            if (!roleExists || !permissionExists)
            {
                return BadRequest("Invalid RoleId or PermissionId.");
            }

            rolePermission.RoleId = updateDto.RoleId;
            rolePermission.PermissionId = updateDto.PermissionId;

            _context.Entry(rolePermission).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RolePermissionExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a role permission by ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRolePermission(int id)
        {
            var rolePermission = await _context.RolePermissions.FindAsync(id);
            if (rolePermission == null)
            {
                return NotFound();
            }

            _context.RolePermissions.Remove(rolePermission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RolePermissionExists(int id) => _context.RolePermissions.Any(rp => rp.RolePermissionId == id);
    }

    // DTOs
    public class RolePermissionDto
    {
        public int RolePermissionId { get; set; }
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public int PermissionId { get; set; }
        public string? PermissionKey { get; set; }
    }

    public class CreateRolePermissionDto
    {
        [Required]
        public int RoleId { get; set; }

        [Required]
        public int PermissionId { get; set; }
    }

    public class UpdateRolePermissionDto
    {
        [Required]
        public int RolePermissionId { get; set; }

        [Required]
        public int RoleId { get; set; }

        [Required]
        public int PermissionId { get; set; }
    }
}