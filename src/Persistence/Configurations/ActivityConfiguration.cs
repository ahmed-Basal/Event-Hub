using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.HasKey(a => a.ID);

        builder.Property(a => a.Title)
            .IsRequired();

        builder.Property(a => a.Slug)
            .IsRequired();

        builder.Property(a => a.Description)
            .IsRequired();

        builder.Property(a => a.Category)
            .IsRequired();

        builder.Property(a => a.City)
            .IsRequired();

        builder.Property(a => a.Venue)
            .IsRequired();

        builder.Property(a => a.Level)
            .IsRequired();

        builder.Property(a => a.Image)
            .IsRequired();

        builder.Property(a => a.Tags)
            .IsRequired();

        builder.HasMany(a => a.Attendees)
            .WithOne(aa => aa.Activity)
            .HasForeignKey(aa => aa.ActivityId);
    }
}
