using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class AccessLogs
{
    [Key]
    [Column("log_id")]
    public int LogId { get; set; }

    [Column("employee_id")]
    public int? EmployeeId { get; set; }

    [Column("room_id")]
    public int? RoomId { get; set; }

    [Column("access_time")]
    public DateTime? AccessTime { get; set; } = DateTime.UtcNow;

    [Column("access_granted")]
    public bool? AccessGranted { get; set; }

    [ForeignKey("EmployeeId")]
    public Employees? Employee { get; set; }

    [ForeignKey("RoomId")]
    public Rooms? Room { get; set; }
}