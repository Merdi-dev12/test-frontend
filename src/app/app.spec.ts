import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App shell', () => {
  it('affiche un en-tête simple et indique la sandbox', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('.brand__name')?.textContent).toContain('ziko');
    expect(page.querySelector('.sandbox-badge')?.textContent).toContain('sandbox');
    expect(page.querySelector('.announcement')).toBeNull();
    expect(page.querySelector('nav')).toBeNull();
  });
});
