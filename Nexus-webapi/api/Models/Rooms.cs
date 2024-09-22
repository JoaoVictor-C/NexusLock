using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class Rooms
{
    [Key]
    [Column("room_id")]
    public int RoomId { get; set; }

    [Required]
    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Required]
    [Column("status")]
    public bool Status { get; set; } = false;

    [Column("image", TypeName = "LONGBLOB")]
    public byte[]? Image { get; set; }

    [Column("occupied_by_employee_id")]
    public int? OccupiedByEmployeeId { get; set; }

    [ForeignKey("OccupiedByEmployeeId")]
    public Employees? OccupiedByEmployee { get; set; }
}
