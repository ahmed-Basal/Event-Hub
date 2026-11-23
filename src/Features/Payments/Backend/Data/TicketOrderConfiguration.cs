using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class TicketOrderConfiguration : IEntityTypeConfiguration<TicketOrder>
{
    public void Configure(EntityTypeBuilder<TicketOrder> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Amount).HasPrecision(18, 2);
        builder.Property(o => o.Currency).HasMaxLength(10).IsRequired();
        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(30);

        builder.HasOne(o => o.Activity)
            .WithMany()
            .HasForeignKey(o => o.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.StripeSessionId);
        builder.HasIndex(o => new { o.UserId, o.ActivityId });
        builder.Property<uint>("xmin").IsRowVersion();
    }
}
