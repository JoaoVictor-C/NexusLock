using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class EmployeeRoles
{
    [Key]
    [Column("employee_role_id")]
    public int EmployeeRoleId { get; set; }

    [Column("employee_id")]
    public int? EmployeeId { get; set; }

    [Column("role_id")]
    public int? RoleId { get; set; }

    [ForeignKey("EmployeeId")]
    public Employees? Employee { get; set; }

    [ForeignKey("RoleId")]
    public Roles? Role { get; set; }
}
