using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class EmployeeRoomAccess
{
    [Key]
    [Column("access_id")]
    public int AccessId { get; set; }

    [Column("employee_id")]
    public int? EmployeeId { get; set; }

    [Column("room_id")]
    public int? RoomId { get; set; }

    [ForeignKey("EmployeeId")]
    public Employees? Employee { get; set; }

    [ForeignKey("RoomId")]
    public Rooms? Room { get; set; }
}
