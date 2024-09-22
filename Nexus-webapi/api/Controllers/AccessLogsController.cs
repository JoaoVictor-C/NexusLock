using Microsoft.AspNetCore.Mvc;
using Nexus_webapi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Nexus_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccessLogsController : ControllerBase
    {
        private readonly NexusDbContext _context;

        public AccessLogsController(NexusDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all access logs with optional pagination and filtering.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccessLogDto>>> GetAllAccessLogs(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? employeeId = null,
            [FromQuery] int? roomId = null,
            [FromQuery] bool? accessGranted = null)
        {
            var query = _context.AccessLogs
                .Include(al => al.Employee)
                .Include(al => al.Room)
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(al => al.AccessTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(al => al.AccessTime <= endDate.Value);

            if (employeeId.HasValue)
                query = query.Where(al => al.EmployeeId == employeeId.Value);

            if (roomId.HasValue)
                query = query.Where(al => al.RoomId == roomId.Value);

            if (accessGranted.HasValue)
                query = query.Where(al => al.AccessGranted == accessGranted.Value);

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(al => al.AccessTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(al => new AccessLogDto
                {
                    LogId = al.LogId,
                    EmployeeId = al.EmployeeId,
                    EmployeeName = al.Employee != null ? al.Employee.Name : null,
                    RoomId = al.RoomId,
                    RoomName = al.Room != null ? al.Room.Name : null,
                    AccessTime = al.AccessTime,
                    AccessGranted = al.AccessGranted
                })
                .ToListAsync();

            var result = new
            {
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Logs = logs
            };

            return Ok(result);
        }

        /// <summary>
        /// Retrieves a specific access log by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AccessLogDto>> GetAccessLogById(int id)
        {
            var log = await _context.AccessLogs
                .Include(al => al.Employee)
                .Include(al => al.Room)
                .Where(al => al.LogId == id)
                .Select(al => new AccessLogDto
                {
                    LogId = al.LogId,
                    EmployeeId = al.EmployeeId,
                    EmployeeName = al.Employee != null ? al.Employee.Name : null,
                    RoomId = al.RoomId,
                    RoomName = al.Room != null ? al.Room.Name : null,
                    AccessTime = al.AccessTime,
                    AccessGranted = al.AccessGranted
                })
                .FirstOrDefaultAsync();

            if (log == null)
            {
                return NotFound();
            }

            return Ok(log);
        }

        /// <summary>
        /// Creates a new access log.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<AccessLogDto>> CreateAccessLog(CreateAccessLogDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var accessLog = new AccessLogs
            {
                EmployeeId = createDto.EmployeeId,
                RoomId = createDto.RoomId,
                AccessGranted = createDto.AccessGranted,
                AccessTime = createDto.AccessTime ?? DateTime.UtcNow
            };

            _context.AccessLogs.Add(accessLog);
            await _context.SaveChangesAsync();

            // Load related data
            await _context.Entry(accessLog).Reference(al => al.Employee).LoadAsync();
            await _context.Entry(accessLog).Reference(al => al.Room).LoadAsync();

            var accessLogDto = new AccessLogDto
            {
                LogId = accessLog.LogId,
                EmployeeId = accessLog.EmployeeId,
                EmployeeName = accessLog.Employee?.Name,
                RoomId = accessLog.RoomId,
                RoomName = accessLog.Room?.Name,
                AccessTime = accessLog.AccessTime,
                AccessGranted = accessLog.AccessGranted
            };

            return CreatedAtAction(nameof(GetAccessLogById), new { id = accessLog.LogId }, accessLogDto);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<AccessLogDto>>> GetAccessLogsByEmployee(int employeeId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var logs = await _context.AccessLogs
                .Where(al => al.EmployeeId == employeeId)
                .Include(al => al.Employee)
                .Include(al => al.Room)
                .OrderByDescending(al => al.AccessTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(al => new AccessLogDto
                {
                    LogId = al.LogId,
                    EmployeeId = al.EmployeeId,
                    EmployeeName = al.Employee != null ? al.Employee.Name : null,
                    RoomId = al.RoomId,
                    RoomName = al.Room != null ? al.Room.Name : null,
                    AccessTime = al.AccessTime,
                    AccessGranted = al.AccessGranted
                })
                .ToListAsync();

            return Ok(logs);
        }

        private bool AccessLogExists(int id) => _context.AccessLogs.Any(al => al.LogId == id);
    }

    // DTOs
    public class AccessLogDto
    {
        public int LogId { get; set; }
        public int? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public int? RoomId { get; set; }
        public string? RoomName { get; set; }
        public DateTime? AccessTime { get; set; }
        public bool? AccessGranted { get; set; }
    }

    public class CreateAccessLogDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int RoomId { get; set; }

        [Required]
        public bool AccessGranted { get; set; }

        public DateTime? AccessTime { get; set; }
    }
}