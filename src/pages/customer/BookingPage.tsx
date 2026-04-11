import { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';

const timeSlots = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
];

const BookingPage = () => {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState('2');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot || !name || !phone) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSuccess(true);
    toast.success('Table booked successfully!');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-sage" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your table has been reserved for
            </p>
            <p className="text-lg font-semibold text-foreground mb-1">
              {date && format(date, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-lg font-semibold text-primary mb-6">
              {timeSlot} • {guests} Guests
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              A confirmation has been sent to your phone. Please arrive 10 minutes before your reservation.
            </p>
            <Button variant="hero" onClick={() => setIsSuccess(false)}>
              Book Another Table
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-12">
        {/* Hero */}
        <section className="relative h-64 mb-12">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&h=400&fit=crop"
              alt="Restaurant interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-hero" />
          </div>
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-background mb-4">
                Reserve Your Table
              </h1>
              <p className="text-background/80 max-w-lg">
                Book your perfect dining experience. Special moments deserve a special setting.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-medium">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Select Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Select Time
                  </Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger className="h-12">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Guests */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Number of Guests
                  </Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="h-12">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-12"
                  />
                </div>

                {/* Phone */}
                <div className="md:col-span-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-12"
                  />
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full mt-8">
                Confirm Reservation
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
