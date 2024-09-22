using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class Employees
{
    [Key]
    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Required]
    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; }

    [Required]
    [Column("email")]
    [StringLength(100)]
    public string Email { get; set; }

    [Required]

    [Column("password_hash")]
    [StringLength(256)]
    public string PasswordHash { get; set; }

    [Required]
    [Column("pin_code")]
    [StringLength(4, MinimumLength = 4)]
    public string PinCode { get; set; }

    [Column("fingerprint_data")]
    public byte[]? FingerprintData { get; set; }

    [Column("fingerprint_data_base64")]
    public string? FingerprintDataBase64 { get; set; }
}
