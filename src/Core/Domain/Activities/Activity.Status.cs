namespace Core.Domain;

public partial class Activity
{
    public void Cancel() => IsCancelled = true;

    public void Reactivate() => IsCancelled = false;
}
